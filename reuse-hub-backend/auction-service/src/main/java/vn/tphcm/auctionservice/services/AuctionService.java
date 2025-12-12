package vn.tphcm.auctionservice.services;

import org.springframework.web.multipart.MultipartFile;
import vn.tphcm.auctionservice.dtos.ApiResponse;
import vn.tphcm.auctionservice.dtos.PageResponse;
import vn.tphcm.auctionservice.dtos.request.CreateAuctionRequest;
import vn.tphcm.auctionservice.dtos.request.PlaceBidRequest;
import vn.tphcm.auctionservice.dtos.response.AuctionResponse;
import vn.tphcm.auctionservice.dtos.response.BidResponse;

import java.util.List;

public interface AuctionService {

    ApiResponse<AuctionResponse> createAuction(String sellerId, CreateAuctionRequest request, List<MultipartFile> images);

    ApiResponse<AuctionResponse> getAuctionById(String auctionId, String currentUserId);

    ApiResponse<BidResponse> placeBid(String auctionId, String bidderId, PlaceBidRequest request);

    ApiResponse<AuctionResponse> buyNow(String auctionId, String buyerId);

    ApiResponse<Void> cancelAuction(String auctionId, String sellerId);

    ApiResponse<PageResponse<AuctionResponse>> getActiveAuctions(int pageNo, int pageSize, String sortBy, String sortDirection);

    ApiResponse<PageResponse<AuctionResponse>> getAuctionsBySeller(String sellerId, int pageNo, int pageSize);

    ApiResponse<PageResponse<AuctionResponse>> getAuctionsEndingSoon(int pageNo, int pageSize);

    ApiResponse<PageResponse<AuctionResponse>> getHotAuctions(int pageNo, int pageSize);

    ApiResponse<PageResponse<AuctionResponse>> searchAuctions(String keyword, int pageNo, int pageSize);

    ApiResponse<PageResponse<AuctionResponse>> getMyBiddingAuctions(String userId, int pageNo, int pageSize);

    ApiResponse<PageResponse<AuctionResponse>> getWonAuctions(String userId, int pageNo, int pageSize);

    ApiResponse<PageResponse<BidResponse>> getAuctionBids(String auctionId, int pageNo, int pageSize);

    void processEndedAuctions();

    void processStartingAuctions();
}
