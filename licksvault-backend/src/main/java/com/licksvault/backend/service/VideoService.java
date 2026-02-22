package com.licksvault.backend.service;

import io.minio.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import ws.schild.jave.MultimediaObject;
import ws.schild.jave.ScreenExtractor;
import ws.schild.jave.info.MultimediaInfo;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class VideoService {

    private final MinioClient minioClient;

    @Value("${minio.bucketName}")
    private String bucketName;

    public String uploadVideo(MultipartFile file) {
        try {
            ensureBucketExists();

            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(filename)
                            .stream(file.getInputStream(), file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );

            return filename;
        } catch (Exception e) {
            log.error("Error uploading video to MinIO", e);
            throw new RuntimeException("Could not upload video", e);
        }
    }

    public String generateThumbnail(MultipartFile videoFile) {
        File tempVideo = null;
        File tempThumb = null;
        try {
            tempVideo = File.createTempFile("video_", "_" + videoFile.getOriginalFilename());
            videoFile.transferTo(tempVideo);

            tempThumb = File.createTempFile("thumb_", ".jpg");

            MultimediaObject multimediaObject = new MultimediaObject(tempVideo);
            MultimediaInfo info = multimediaObject.getInfo();
            long duration = info.getDuration();

            // Extract frame at 1 second or at the middle if shorter
            long offset = Math.min(1000, duration / 2);

            ScreenExtractor screenExtractor = new ScreenExtractor();
            screenExtractor.renderOneImage(multimediaObject, -1, -1, offset, tempThumb, 1);

            String thumbFilename = "thumb_" + UUID.randomUUID() + ".jpg";
            ensureBucketExists();

            try (InputStream is = new FileInputStream(tempThumb)) {
                minioClient.putObject(
                        PutObjectArgs.builder()
                                .bucket(bucketName)
                                .object(thumbFilename)
                                .stream(is, tempThumb.length(), -1)
                                .contentType("image/jpeg")
                                .build()
                );
            }

            return thumbFilename;
        } catch (Exception e) {
            log.error("Error generating thumbnail", e);
            // Don't fail the whole upload if thumbnail fails, just return null
            return null;
        } finally {
            if (tempVideo != null && tempVideo.exists()) {
                tempVideo.delete();
            }
            if (tempThumb != null && tempThumb.exists()) {
                tempThumb.delete();
            }
        }
    }

    private void ensureBucketExists() throws Exception {
        boolean found = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
        if (!found) {
            minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
        }
    }

    public InputStream getVideoData(String filename) {
        try {
            return minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(bucketName)
                            .object(filename)
                            .build()
            );
        } catch (Exception e) {
            log.error("Error getting video data from MinIO", e);
            throw new RuntimeException("Could not get video data", e);
        }
    }
}
