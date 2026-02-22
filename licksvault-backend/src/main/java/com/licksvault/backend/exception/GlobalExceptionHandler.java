package com.licksvault.backend.exception;

import jakarta.validation.ConstraintViolation;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.ErrorResponse;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import jakarta.validation.ConstraintViolationException;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ErrorResponse handleResourceNotFoundException(ResourceNotFoundException ex) {
        return ErrorResponse.builder(ex, HttpStatus.NOT_FOUND, ex.getMessage())
                .build();
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ErrorResponse handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return ErrorResponse.builder(ex, HttpStatus.BAD_REQUEST, "Validation failed")
                .property("errors", errors)
                .build();
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ErrorResponse handleConstraintViolationException(ConstraintViolationException ex) {
        Map<String, String> errors = ex.getConstraintViolations().stream()
                .collect(Collectors.toMap(
                        violation -> violation.getPropertyPath().toString(),
                        ConstraintViolation::getMessage,
                        (existing, replacement) -> existing
                ));
        return ErrorResponse.builder(ex, HttpStatus.BAD_REQUEST, "Validation failed")
                .property("errors", errors)
                .build();
    }

    @ExceptionHandler(Exception.class)
    public ErrorResponse handleGlobalException(Exception ex) {
        return ErrorResponse.builder(ex, HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred: " + ex.getMessage())
                .build();
    }
}
