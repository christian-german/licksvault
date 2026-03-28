// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::thread;
use tiny_http::{Server, Response, Method};
use std::process::Command;
use serde::{Deserialize, Serialize};
use base64::{Engine as _, engine::general_purpose};
use std::io::{Write, Read};
use std::path::PathBuf;
use notify::{Watcher, RecursiveMode, Config, event::EventKind, PollWatcher};
use std::time::Duration;

#[derive(Serialize, Deserialize)]
struct OpenFileRequest {
    filename: Option<String>,
    content: Option<String>,
    lick_id: Option<i64>,
    api_url: Option<String>,
}

fn watch_and_upload(path: PathBuf, lick_id: i64, api_url: String) {
    thread::spawn(move || {
        println!("Starting watcher for file: {:?}", path);
        let (tx, rx) = std::sync::mpsc::channel();

        let mut watcher = PollWatcher::new(tx, Config::default().with_poll_interval(Duration::from_secs(2))).unwrap();

        watcher.watch(&path, RecursiveMode::NonRecursive).unwrap();

        for res in rx {
            match res {
                Ok(event) => {
                    println!("Received event: {:?}", event);
                    // Match any modify event (including metadata/data) or any event that could indicate a change
                    match event.kind {
                        EventKind::Modify(_) | EventKind::Create(_) | EventKind::Any => {
                            println!("File change detected, uploading: {:?}", path);
                            // Small delay to ensure file is fully written/closed
                            thread::sleep(Duration::from_millis(500));
                            if let Err(e) = upload_file(&path, lick_id, &api_url) {
                                eprintln!("Failed to upload file: {:?}", e);
                            }
                        }
                        _ => {}
                    }
                }
                Err(e) => println!("watch error: {:?}", e),
            }
        }
    });
}

fn upload_file(path: &PathBuf, lick_id: i64, api_url: &str) -> Result<(), Box<dyn std::error::Error>> {
    let client = reqwest::blocking::Client::new();
    
    // 1. Read the modified file
    let mut file = std::fs::File::open(path)?;
    let mut buffer = Vec::new();
    file.read_to_end(&mut buffer)?;

    // 2. Perform the update using the new PATCH endpoint
    let form = reqwest::blocking::multipart::Form::new()
        .part("gpFile", reqwest::blocking::multipart::Part::bytes(buffer).file_name("file.gp"));

    let url = format!("{}/licks/{}/gp-file", api_url, lick_id);
    let response = client.patch(url).multipart(form).send()?;

    if response.status().is_success() {
        println!("Successfully uploaded file for lick {}", lick_id);
        Ok(())
    } else {
        let status = response.status();
        let error_body = response.text().unwrap_or_default();
        Err(format!("Upload failed with status: {}. Body: {}", status, error_body).into())
    }
}

fn open_guitar_pro(file_path: Option<PathBuf>) {
    let (shell, args_prefix) = if cfg!(target_os = "linux") {
        ("/mnt/c/Windows/System32/cmd.exe", vec!["/C", "start", ""])
    } else {
        ("cmd.exe", vec!["/C", "start", ""])
    };

    let mut command = Command::new(shell);
    for arg in args_prefix {
        command.arg(arg);
    }

    if let Some(path) = file_path {
        let path_str = path.to_str().unwrap();
        let final_path = if cfg!(target_os = "linux") && path_str.starts_with("/mnt/c/") {
            // Convert /mnt/c/Users/... to C:\Users\...
            format!("C:\\{}", &path_str[7..].replace('/', "\\"))
        } else {
            path_str.to_string()
        };
        println!("Opening file: {}", final_path);
        command.arg(final_path);
    } else {
        let gp_path = if cfg!(target_os = "linux") {
            r#"C:\Program Files\Arobas Music\Guitar Pro 8\GuitarPro.exe"#.to_string()
        } else {
            r#"C:\Program Files\Arobas Music\Guitar Pro 8\GuitarPro.exe"#.to_string()
        };
        println!("Opening Guitar Pro...");
        command.arg(gp_path);
    }

    if let Err(e) = command.spawn() {
        eprintln!("failed to launch via shell: {:?}", e);
    }
}

fn start_local_server() {
    thread::spawn(|| {
        let server = Server::http("127.0.0.1:43125").unwrap();

        println!("Companion listening on http://127.0.0.1:43125");

        for mut request in server.incoming_requests() {
            let url = request.url().to_string();
            let method = request.method().clone();

            match (method, url.as_str()) {
                (Method::Get, "/ping") => {
                    let response = Response::from_string("pong")
                        .with_header(tiny_http::Header::from_bytes(&b"Access-Control-Allow-Origin"[..], &b"*"[..]).unwrap());
                    let _ = request.respond(response);
                }

                (Method::Get, "/open") => {
                    println!("Opening Guitar Pro...");

                    open_guitar_pro(None);

                    let response = Response::from_string("opened")
                        .with_header(tiny_http::Header::from_bytes(&b"Access-Control-Allow-Origin"[..], &b"*"[..]).unwrap());
                    let _ = request.respond(response);
                }

                (Method::Post, "/open-file") => {
                    let mut content = String::new();
                    request.as_reader().read_to_string(&mut content).unwrap();

                    if let Ok(open_req) = serde_json::from_str::<OpenFileRequest>(&content) {
                        let filename = open_req.filename.clone().unwrap_or_else(|| {
                            if let Some(id) = open_req.lick_id {
                                format!("lick_{}.gp", id)
                            } else {
                                "new_lick.gp".to_string()
                            }
                        });

                        println!("Downloading and opening file: {}", filename);

                        // Decode base64 or use empty.gp template
                        let file_bytes = if let Some(content_base64) = open_req.content {
                            general_purpose::STANDARD.decode(&content_base64).unwrap_or_else(|_| {
                                include_bytes!("empty.gp").to_vec()
                            })
                        } else {
                            include_bytes!("empty.gp").to_vec()
                        };

                        // Create temp file
                        let windows_temp = PathBuf::from("/mnt/c/Users/chris/AppData/Local/Temp");
                        let temp_file_path = windows_temp.join(&filename);

                        let mut file = std::fs::File::create(&temp_file_path).expect("failed to create temp file");
                        file.write_all(&file_bytes).expect("failed to write to temp file");

                        println!("File saved to: {:?}", temp_file_path);

                        // Start watching for changes if lick_id and api_url are provided
                        if let (Some(lick_id), Some(api_url)) = (open_req.lick_id, open_req.api_url) {
                            watch_and_upload(temp_file_path.clone(), lick_id, api_url);
                        }

                        // Open with Guitar Pro
                        open_guitar_pro(Some(temp_file_path));

                        let response = Response::from_string("opened")
                            .with_header(tiny_http::Header::from_bytes(&b"Access-Control-Allow-Origin"[..], &b"*"[..]).unwrap());
                        let _ = request.respond(response);
                    } else {
                        let response = Response::from_string("invalid json").with_status_code(400)
                            .with_header(tiny_http::Header::from_bytes(&b"Access-Control-Allow-Origin"[..], &b"*"[..]).unwrap());
                        let _ = request.respond(response);
                    }
                }

                (Method::Options, _) => {
                    let response = Response::from_string("")
                        .with_header(tiny_http::Header::from_bytes(&b"Access-Control-Allow-Origin"[..], &b"*"[..]).unwrap())
                        .with_header(tiny_http::Header::from_bytes(&b"Access-Control-Allow-Methods"[..], &b"GET, POST, OPTIONS"[..]).unwrap())
                        .with_header(tiny_http::Header::from_bytes(&b"Access-Control-Allow-Headers"[..], &b"Content-Type"[..]).unwrap());
                    let _ = request.respond(response);
                }

                _ => {
                    let response =
                        Response::from_string("not found").with_status_code(404)
                        .with_header(tiny_http::Header::from_bytes(&b"Access-Control-Allow-Origin"[..], &b"*"[..]).unwrap());
                    let _ = request.respond(response);
                }
            }
        }
    });
}

fn main() {
    start_local_server();
    licksvault_companion_lib::run();
}