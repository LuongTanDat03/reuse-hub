/*
 * @ (#) GlobalException.java       1.0     8/13/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.itemservice.exceptions;
/*
 * @author: Luong Tan Dat
 * @date: 8/13/2025
 */

import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.nio.file.AccessDeniedException;
import java.util.Date;

import static org.springframework.http.HttpStatus.*;
import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

@RestControllerAdvice
public class GlobalExceptionHandling {

    private ErrorResponse errorResponse;

    /**
     * Handle exception when the request is forbidden (e.g., user does not have permission to access the resource).
     *
     * @param e
     * @param req
     * @return
     */
    @ExceptionHandler(AccessDeniedException.class)
    @ApiResponses(
            @ApiResponse(responseCode = "403", description = "Forbidden",
                    content = {@Content(mediaType = APPLICATION_JSON_VALUE,
                            examples = @ExampleObject(
                                    name = "403 Response",
                                    summary = "Handle exception when forbidden",
                                    value = """
                                            {
                                                "timestamp": "2025-03-29T09:00:00.000+00:00",
                                                "status": 403,
                                                "path": "/api/v1/...",
                                                "error": "Forbidden",
                                                "message": "{data} is not allowed to access this resource"
                                            }
                                            """
                            )
                    )})
    )
    public ErrorResponse handleAccessDeniedException(AccessDeniedException e, WebRequest req) {
        errorResponse = new ErrorResponse();
        errorResponse.setTimestamp(new Date());
        errorResponse.setPath(req.getDescription(false).replace("url=", ""));
        errorResponse.setStatus(FORBIDDEN.value());
        errorResponse.setError(FORBIDDEN.getReasonPhrase());
        errorResponse.setMessage(e.getMessage());
        return errorResponse;
    }

    /**
     * Handle exception when the data is conflicted.
     *
     * @param e
     * @param req
     * @return
     */
    @ExceptionHandler(InvalidDataException.class)
    @ApiResponses(
            @ApiResponse(responseCode = "409", description = "Conflicted",
                    content = {@Content(mediaType = APPLICATION_JSON_VALUE,
                            examples = @ExampleObject(
                                    name = "409 Response",
                                    summary = "Handle exception when input data is conflicted",
                                    value = """
                                            {
                                                "timestamp": "2025-03-29T09:00:00.000+00:00",
                                                "status": 409,
                                                "path": "/api/v1/...",
                                                "error": "Conflicted",
                                                "message": "{data} exists, Please try again!"
                                            }
                                            """
                            )
                    )})
    )
    public ErrorResponse handleInvalidDataException(InvalidDataException e, WebRequest req) {
        errorResponse = new ErrorResponse();
        errorResponse.setTimestamp(new Date());
        errorResponse.setPath(req.getDescription(false).replace("url=", ""));
        errorResponse.setStatus(BAD_REQUEST.value());
        errorResponse.setError(BAD_REQUEST.getReasonPhrase());
        errorResponse.setMessage(e.getMessage());

        return errorResponse;
    }

    /**
     * Handle exception when database constraint violation (DataIntegrityViolationException).
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    @ApiResponses(
            @ApiResponse(responseCode = "409", description = "Data Integrity Violation",
                    content = {@Content(mediaType = APPLICATION_JSON_VALUE,
                            examples = @ExampleObject(
                                    name = "409 Response",
                                    summary = "Handle database constraint violations",
                                    value = """
                                            {
                                                "timestamp": "2025-03-29T09:00:00.000+00:00",
                                                "status": 409,
                                                "path": "/api/v1/...",
                                                "error": "Conflict",
                                                "message": "Email or username already exists"
                                            }
                                            """
                            )
                    )})
    )
    public ErrorResponse handleDataIntegrityViolationException(DataIntegrityViolationException e, WebRequest req) {
        errorResponse = new ErrorResponse();
        errorResponse.setTimestamp(new Date());
        errorResponse.setPath(req.getDescription(false).replace("uri=", ""));
        errorResponse.setStatus(CONFLICT.value());
        errorResponse.setError(CONFLICT.getReasonPhrase());

        String message = "Data already exists";
        if (e.getMessage().contains("email")) {
            message = "Email already exists";
        } else if (e.getMessage().contains("username")) {
            message = "Username already exists";
        } else if (e.getMessage().contains("phone")) {
            message = "Phone number already exists";
        }

        errorResponse.setMessage(message);
        return errorResponse;
    }

    /**
     * Handle exception when the request not found data.
     *
     * @param e
     * @param req
     * @return
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    @ApiResponses(
            @ApiResponse(responseCode = "404", description = "Not Found",
                    content = {@Content(mediaType = APPLICATION_JSON_VALUE,
                            examples = @ExampleObject(
                                    name = "404 Response",
                                    summary = "Handle exception when resource not found",
                                    value = """
                                            {
                                                "timestamp": "2025-03-29T09:00:00.000+00:00",
                                                "status": 404,
                                                "path": "/api/v1/...",
                                                "error": "Not Found",
                                                "message": "{data} not found, Please try again!"
                                            }
                                            """
                            )
                    )})
    )
    public ErrorResponse handleResourceNotFoundException(ResourceNotFoundException e, WebRequest req) {
        errorResponse = new ErrorResponse();
        errorResponse.setTimestamp(new Date());
        errorResponse.setPath(req.getDescription(false).replace("url=", ""));
        errorResponse.setStatus(NOT_FOUND.value());
        errorResponse.setError(NOT_FOUND.getReasonPhrase());
        errorResponse.setMessage(e.getMessage());

        return errorResponse;
    }

    /**
     * Handle exception when file upload failed.
     *
     * @param e
     * @param req
     * @return
     */
    @ExceptionHandler(UploadFileFailedException.class)
    @ApiResponses(
            @ApiResponse(responseCode = "409", description = "Conflict",
                    content = {@Content(mediaType = APPLICATION_JSON_VALUE,
                            examples = @ExampleObject(
                                    name = "404 Response",
                                    summary = "Handle exception when resource not found",
                                    value = """
                                            {
                                                "timestamp": "2025-03-29T09:00:00.000+00:00",
                                                "status": 409,
                                                "path": "/api/v1/...",
                                                "error": "Conflict",
                                                "message": "{data} upload failed!"
                                            }
                                            """
                            )
                    )})
    )
    public ErrorResponse handleUploadFileFailed(UploadFileFailedException e, WebRequest req) {
        errorResponse = new ErrorResponse();
        errorResponse.setTimestamp(new Date());
        errorResponse.setPath(req.getDescription(false).replace("url=", ""));
        errorResponse.setStatus(CONFLICT.value());
        errorResponse.setError(CONFLICT.getReasonPhrase());
        errorResponse.setMessage(e.getMessage());

        return errorResponse;
    }

}
