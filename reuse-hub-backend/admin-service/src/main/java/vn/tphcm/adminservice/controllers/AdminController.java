/*
 * @ (#) AdminController.java       1.0     11/25/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.adminservice.controllers;
/*
 * @author: Luong Tan Dat
 * @date: 11/25/2025
 */

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import vn.tphcm.adminservice.dto.ApiResponse;
import vn.tphcm.adminservice.dto.response.*;
import vn.tphcm.adminservice.services.AdminService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin")
@Slf4j(topic = "ADMIN-CONTROLLER")
public class AdminController {
    private final AdminService adminService;

    @GetMapping("/users")
    public ApiResponse<DashboardUserResponse> getAllUser(@RequestParam(defaultValue = "0") int pageNo,
                                                                  @RequestParam(defaultValue = "10") int pageSize,
                                                                  @RequestParam(defaultValue = "createdAt") String sortBy,
                                                                  @RequestParam(defaultValue = "desc") String sortDirection) {
        log.info("AdminController - getAllUser: Received request to fetch all users with pageNo={}, pageSize={}, sortBy={}, sortDirection={}",
                pageNo, pageSize, sortBy, sortDirection);



        return adminService.getAllUsers(pageNo, pageSize, sortBy, sortDirection);
    }

    @GetMapping("/items")
    public ApiResponse<DashboardItemResponse> getAllItems(@RequestParam(defaultValue = "0") int pageNo,
                                                          @RequestParam(defaultValue = "10") int pageSize,
                                                          @RequestParam(defaultValue = "createdAt") String sortBy,
                                                          @RequestParam(defaultValue = "desc") String sortDirection,
                                                          @RequestParam(required = false) String filter,
                                                          @RequestParam(required = false) String categorySlug) {
        log.info("AdminController - getAllItems: Received request to fetch all items with pageNo={}, pageSize={}, sortBy={}, sortDirection={}, filter={}, categorySlug={}",
                pageNo, pageSize, sortBy, sortDirection, filter, categorySlug);

        return adminService.getAllItems(pageNo, pageSize, sortBy, sortDirection, filter, categorySlug);
    }

    @GetMapping("/transactions")
    public ApiResponse<DashboardTransactionResponse> getAllTransactions(@RequestParam(defaultValue = "0") int pageNo,
                                                                             @RequestParam(defaultValue = "10") int pageSize,
                                                                             @RequestParam(defaultValue = "createdAt") String sortBy,
                                                                             @RequestParam(defaultValue = "desc") String sortDirection) {
        log.info("AdminController - getAllTransactions: Received request to fetch all transactions with pageNo={}, pageSize={}, sortBy={}, sortDirection={}",
                pageNo, pageSize, sortBy, sortDirection);

        return adminService.getAllTransactions(pageNo, pageSize, sortBy, sortDirection);
    }

    @PutMapping("/users/{userId}/block")
    public ApiResponse<Void> blockUser(@PathVariable String userId) {
        log.info("AdminController - blockUser: Received request to block user with userId={}", userId);

        return adminService.disableUser(userId);
    }

    @PutMapping("/users/{userId}/unblock")
    public ApiResponse<Void> unblockUser(@PathVariable String userId) {
        log.info("AdminController - unblockUser: Received request to block user with userId={}", userId);

        return adminService.enableUser(userId);
    }

    @PutMapping("/users/{userId}/reset-password")
    public ApiResponse<Void> resetPassword(@PathVariable String userId) {
        log.info("AdminController - resetPassword: Received request to reset password for user with userId={}", userId);

        return adminService.resetPassword(userId);
    }

    @DeleteMapping("/items/{itemId}")
    public ApiResponse<Void> deleteItem(@PathVariable String itemId) {
        log.info("AdminController - deleteItem: Received request to delete item with itemId={}", itemId);

        return adminService.deleteItem(itemId);
    }
}
