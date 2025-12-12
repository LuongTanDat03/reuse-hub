package vn.tphcm.auctionservice.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import vn.tphcm.auctionservice.dtos.ApiResponse;
import vn.tphcm.auctionservice.dtos.PageResponse;
import vn.tphcm.auctionservice.dtos.request.CreateAuctionRequest;
import vn.tphcm.auctionservice.dtos.request.PlaceBidRequest;
import vn.tphcm.auctionservice.dtos.response.AuctionResponse;
import vn.tphcm.auctionservice.dtos.response.BidResponse;
import vn.tphcm.auctionservice.services.AuctionService;

import java.util.List;

@RestController
@RequestMapping("/auctions")
@RequiredArgsConstructor
@Slf4j(topic = "AUCTION-CONTROLLER")
@Tag(name = "Auction", description = "Auction management APIs")
public class AuctionController {

    private final AuctionService auctionService;

    @PostMapping("/create/{sellerId}")
    @Operation(summary = "Create new auction")
    public ApiResponse<AuctionResponse> createAuction(
            @PathVariable String sellerId,
            @Valid @RequestPart("request") CreateAuctionRequest request,
            @RequestPart(value = "images", required = false) List<org.springframework.web.multipart.MultipartFile> images) {
        log.info("Creating auction for seller: {} with {} images", sellerId, images != null ? images.size() : 0);
        return auctionService.createAuction(sellerId, request, images);
    }

    @GetMapping("/{auctionId}")
    @Operation(summary = "Get auction by ID")
    public ApiResponse<AuctionResponse> getAuctionById(
            @PathVariable String auctionId,
            @RequestParam(required = false) String currentUserId) {
        log.info("Getting auction: {}", auctionId);
        return auctionService.getAuctionById(auctionId, currentUserId);
    }

    @PostMapping("/{auctionId}/bid/{bidderId}")
    @Operation(summary = "Place a bid on auction")
    public ApiResponse<BidResponse> placeBid(
            @PathVariable String auctionId,
            @PathVariable String bidderId,
            @Valid @RequestBody PlaceBidRequest request) {
        log.info("Placing bid on auction: {} by user: {}", auctionId, bidderId);
        return auctionService.placeBid(auctionId, bidderId, request);
    }

    @PostMapping("/{auctionId}/buy-now/{buyerId}")
    @Operation(summary = "Buy now (instant purchase)")
    public ApiResponse<AuctionResponse> buyNow(
            @PathVariable String auctionId,
            @PathVariable String buyerId) {
        log.info("Buy now on auction: {} by user: {}", auctionId, buyerId);
        return auctionService.buyNow(auctionId, buyerId);
    }

    @DeleteMapping("/{auctionId}/cancel/{sellerId}")
    @Operation(summary = "Cancel auction (only if no bids)")
    public ApiResponse<Void> cancelAuction(
            @PathVariable String auctionId,
            @PathVariable String sellerId) {
        log.info("Cancelling auction: {} by seller: {}", auctionId, sellerId);
        return auctionService.cancelAuction(auctionId, sellerId);
    }

    @GetMapping("/active")
    @Operation(summary = "Get all active auctions")
    public ApiResponse<PageResponse<AuctionResponse>> getActiveAuctions(
            @RequestParam(defaultValue = "0") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {
        return auctionService.getActiveAuctions(pageNo, pageSize, sortBy, sortDirection);
    }

    @GetMapping("/seller/{sellerId}")
    @Operation(summary = "Get auctions by seller")
    public ApiResponse<PageResponse<AuctionResponse>> getAuctionsBySeller(
            @PathVariable String sellerId,
            @RequestParam(defaultValue = "0") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize) {
        return auctionService.getAuctionsBySeller(sellerId, pageNo, pageSize);
    }

    @GetMapping("/ending-soon")
    @Operation(summary = "Get auctions ending soon")
    public ApiResponse<PageResponse<AuctionResponse>> getAuctionsEndingSoon(
            @RequestParam(defaultValue = "0") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize) {
        return auctionService.getAuctionsEndingSoon(pageNo, pageSize);
    }

    @GetMapping("/hot")
    @Operation(summary = "Get hot auctions (most bids)")
    public ApiResponse<PageResponse<AuctionResponse>> getHotAuctions(
            @RequestParam(defaultValue = "0") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize) {
        return auctionService.getHotAuctions(pageNo, pageSize);
    }

    @GetMapping("/search")
    @Operation(summary = "Search auctions by keyword")
    public ApiResponse<PageResponse<AuctionResponse>> searchAuctions(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize) {
        return auctionService.searchAuctions(keyword, pageNo, pageSize);
    }

    @GetMapping("/my-bids/{userId}")
    @Operation(summary = "Get auctions user has bid on")
    public ApiResponse<PageResponse<AuctionResponse>> getMyBiddingAuctions(
            @PathVariable String userId,
            @RequestParam(defaultValue = "0") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize) {
        return auctionService.getMyBiddingAuctions(userId, pageNo, pageSize);
    }

    @GetMapping("/won/{userId}")
    @Operation(summary = "Get auctions user has won")
    public ApiResponse<PageResponse<AuctionResponse>> getWonAuctions(
            @PathVariable String userId,
            @RequestParam(defaultValue = "0") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize) {
        return auctionService.getWonAuctions(userId, pageNo, pageSize);
    }

    @GetMapping("/{auctionId}/bids")
    @Operation(summary = "Get bid history for auction")
    public ApiResponse<PageResponse<BidResponse>> getAuctionBids(
            @PathVariable String auctionId,
            @RequestParam(defaultValue = "0") int pageNo,
            @RequestParam(defaultValue = "20") int pageSize) {
        return auctionService.getAuctionBids(auctionId, pageNo, pageSize);
    }
}
