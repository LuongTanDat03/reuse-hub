package vn.tphcm.auctionservice.services.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.tphcm.auctionservice.commons.AuctionStatus;
import vn.tphcm.auctionservice.commons.BidStatus;
import vn.tphcm.auctionservice.dtos.ApiResponse;
import vn.tphcm.auctionservice.dtos.PageResponse;
import vn.tphcm.auctionservice.dtos.request.CreateAuctionRequest;
import vn.tphcm.auctionservice.dtos.request.PlaceBidRequest;
import vn.tphcm.auctionservice.dtos.response.AuctionResponse;
import vn.tphcm.auctionservice.dtos.response.BidResponse;
import vn.tphcm.auctionservice.mapper.AuctionMapper;
import vn.tphcm.auctionservice.mapper.BidMapper;
import vn.tphcm.auctionservice.models.Auction;
import vn.tphcm.auctionservice.models.Bid;
import vn.tphcm.auctionservice.repositories.AuctionRepository;
import vn.tphcm.auctionservice.repositories.BidRepository;
import vn.tphcm.auctionservice.services.AuctionService;
import vn.tphcm.auctionservice.services.MessageProducer;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "AUCTION-SERVICE")
public class AuctionServiceImpl implements AuctionService {

    private final AuctionRepository auctionRepository;
    private final BidRepository bidRepository;
    private final AuctionMapper auctionMapper;
    private final BidMapper bidMapper;
    private final MessageProducer messageProducer;
    private final vn.tphcm.auctionservice.services.SupabaseStorageService supabaseStorageService;

    @Override
    @Transactional
    public ApiResponse<AuctionResponse> createAuction(String sellerId, CreateAuctionRequest request, List<org.springframework.web.multipart.MultipartFile> images) {
        log.info("Creating auction for seller: {} with {} images", sellerId, images != null ? images.size() : 0);

        // Upload images to Supabase
        if (images != null && !images.isEmpty()) {
            try {
                List<vn.tphcm.auctionservice.dtos.response.ImageUploadResponse> uploadedImages = 
                    supabaseStorageService.uploadImages(images, "auctions");
                List<String> imageUrls = uploadedImages.stream()
                    .map(vn.tphcm.auctionservice.dtos.response.ImageUploadResponse::getImageUrl)
                    .toList();
                request.setImages(imageUrls);
            } catch (Exception e) {
                log.error("Error uploading images", e);
                return ApiResponse.<AuctionResponse>builder()
                        .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                        .message("Lỗi khi upload ảnh: " + e.getMessage())
                        .build();
            }
        }

        // Validate times
        if (request.getEndTime().isBefore(request.getStartTime())) {
            return ApiResponse.<AuctionResponse>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message("Thời gian kết thúc phải sau thời gian bắt đầu")
                    .build();
        }

        if (request.getBuyNowPrice() != null && request.getBuyNowPrice() <= request.getStartingPrice()) {
            return ApiResponse.<AuctionResponse>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message("Giá mua ngay phải lớn hơn giá khởi điểm")
                    .build();
        }

        Auction auction = auctionMapper.toEntity(request);
        auction.setSellerId(sellerId);
        
        // Set status based on start time
        if (request.getStartTime().isBefore(LocalDateTime.now()) || 
            request.getStartTime().isEqual(LocalDateTime.now())) {
            auction.setStatus(AuctionStatus.ACTIVE);
        } else {
            auction.setStatus(AuctionStatus.PENDING);
        }

        auction = auctionRepository.save(auction);

        // Send notification
        messageProducer.sendAuctionCreatedEvent(auction);

        AuctionResponse response = auctionMapper.toResponse(auction);
        
        return ApiResponse.<AuctionResponse>builder()
                .status(HttpStatus.CREATED.value())
                .message("Tạo phiên đấu giá thành công")
                .data(response)
                .build();
    }

    @Override
    public ApiResponse<AuctionResponse> getAuctionById(String auctionId, String currentUserId) {
        Optional<Auction> auctionOpt = auctionRepository.findById(auctionId);
        
        if (auctionOpt.isEmpty()) {
            return ApiResponse.<AuctionResponse>builder()
                    .status(HttpStatus.NOT_FOUND.value())
                    .message("Không tìm thấy phiên đấu giá")
                    .build();
        }

        Auction auction = auctionOpt.get();
        AuctionResponse response = auctionMapper.toResponse(auction);
        
        // Get unique bidders count
        response.setUniqueBidders(bidRepository.countUniqueBidders(auctionId));

        // Check if current user is highest bidder
        if (currentUserId != null) {
            Optional<Bid> highestBid = bidRepository.findHighestBid(auctionId);
            Optional<Bid> userHighestBid = bidRepository.findHighestBidByUser(auctionId, currentUserId);
            
            response.setIsUserHighestBidder(
                highestBid.isPresent() && highestBid.get().getBidderId().equals(currentUserId)
            );
            response.setUserHighestBid(userHighestBid.map(Bid::getAmount).orElse(null));
        }

        return ApiResponse.<AuctionResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Lấy thông tin đấu giá thành công")
                .data(response)
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<BidResponse> placeBid(String auctionId, String bidderId, PlaceBidRequest request) {
        log.info("Placing bid on auction: {} by user: {}", auctionId, bidderId);

        Optional<Auction> auctionOpt = auctionRepository.findById(auctionId);
        
        if (auctionOpt.isEmpty()) {
            return ApiResponse.<BidResponse>builder()
                    .status(HttpStatus.NOT_FOUND.value())
                    .message("Không tìm thấy phiên đấu giá")
                    .build();
        }

        Auction auction = auctionOpt.get();

        // Validate auction status
        if (auction.getStatus() != AuctionStatus.ACTIVE) {
            return ApiResponse.<BidResponse>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message("Phiên đấu giá không còn hoạt động")
                    .build();
        }

        // Check if auction has ended
        if (LocalDateTime.now().isAfter(auction.getEndTime())) {
            return ApiResponse.<BidResponse>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message("Phiên đấu giá đã kết thúc")
                    .build();
        }

        // Seller cannot bid on their own auction
        if (auction.getSellerId().equals(bidderId)) {
            return ApiResponse.<BidResponse>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message("Bạn không thể đấu giá sản phẩm của chính mình")
                    .build();
        }

        // Validate bid amount
        Long minBid = auction.getCurrentPrice() + auction.getBidIncrement();
        if (request.getAmount() < minBid) {
            return ApiResponse.<BidResponse>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message("Giá đấu tối thiểu là " + minBid + "đ")
                    .build();
        }

        // Get previous highest bidder for outbid notification
        Optional<Bid> previousHighestBid = bidRepository.findHighestBid(auctionId);
        String previousHighestBidderId = previousHighestBid.map(Bid::getBidderId).orElse(null);

        // Mark previous highest bid as outbid
        if (previousHighestBid.isPresent() && !previousHighestBid.get().getBidderId().equals(bidderId)) {
            Bid prevBid = previousHighestBid.get();
            prevBid.setStatus(BidStatus.OUTBID);
            bidRepository.save(prevBid);
        }

        // Create new bid
        Bid bid = Bid.builder()
                .auction(auction)
                .bidderId(bidderId)
                .amount(request.getAmount())
                .maxAutoBid(request.getMaxAutoBid())
                .status(BidStatus.ACTIVE)
                .isAutoBid(false)
                .build();

        bid = bidRepository.save(bid);

        // Update auction
        auction.setCurrentPrice(request.getAmount());
        auction.incrementBidCount();
        auctionRepository.save(auction);

        // Send outbid notification to previous highest bidder
        if (previousHighestBidderId != null && !previousHighestBidderId.equals(bidderId)) {
            messageProducer.sendOutbidNotification(auction, previousHighestBidderId, request.getAmount());
        }

        // Send bid placed event for realtime update
        messageProducer.sendBidPlacedEvent(auction, bid);

        BidResponse response = bidMapper.toResponse(bid);

        return ApiResponse.<BidResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Đặt giá thành công")
                .data(response)
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<AuctionResponse> buyNow(String auctionId, String buyerId) {
        log.info("Buy now on auction: {} by user: {}", auctionId, buyerId);

        Optional<Auction> auctionOpt = auctionRepository.findById(auctionId);
        
        if (auctionOpt.isEmpty()) {
            return ApiResponse.<AuctionResponse>builder()
                    .status(HttpStatus.NOT_FOUND.value())
                    .message("Không tìm thấy phiên đấu giá")
                    .build();
        }

        Auction auction = auctionOpt.get();

        if (auction.getBuyNowPrice() == null) {
            return ApiResponse.<AuctionResponse>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message("Phiên đấu giá này không hỗ trợ mua ngay")
                    .build();
        }

        if (auction.getStatus() != AuctionStatus.ACTIVE) {
            return ApiResponse.<AuctionResponse>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message("Phiên đấu giá không còn hoạt động")
                    .build();
        }

        if (auction.getSellerId().equals(buyerId)) {
            return ApiResponse.<AuctionResponse>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message("Bạn không thể mua sản phẩm của chính mình")
                    .build();
        }

        // End auction immediately
        auction.setStatus(AuctionStatus.SOLD);
        auction.setWinnerId(buyerId);
        auction.setCurrentPrice(auction.getBuyNowPrice());
        auction.setEndTime(LocalDateTime.now());
        auctionRepository.save(auction);

        // Send auction ended event
        messageProducer.sendAuctionEndedEvent(auction);

        AuctionResponse response = auctionMapper.toResponse(auction);

        return ApiResponse.<AuctionResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Mua ngay thành công")
                .data(response)
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<Void> cancelAuction(String auctionId, String sellerId) {
        Optional<Auction> auctionOpt = auctionRepository.findById(auctionId);
        
        if (auctionOpt.isEmpty()) {
            return ApiResponse.<Void>builder()
                    .status(HttpStatus.NOT_FOUND.value())
                    .message("Không tìm thấy phiên đấu giá")
                    .build();
        }

        Auction auction = auctionOpt.get();

        if (!auction.getSellerId().equals(sellerId)) {
            return ApiResponse.<Void>builder()
                    .status(HttpStatus.FORBIDDEN.value())
                    .message("Bạn không có quyền hủy phiên đấu giá này")
                    .build();
        }

        if (auction.getBidCount() > 0) {
            return ApiResponse.<Void>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message("Không thể hủy phiên đấu giá đã có người đặt giá")
                    .build();
        }

        auction.setStatus(AuctionStatus.CANCELLED);
        auctionRepository.save(auction);

        return ApiResponse.<Void>builder()
                .status(HttpStatus.OK.value())
                .message("Hủy phiên đấu giá thành công")
                .build();
    }

    @Override
    public ApiResponse<PageResponse<AuctionResponse>> getActiveAuctions(int pageNo, int pageSize, String sortBy, String sortDirection) {
        Sort sort = sortDirection.equalsIgnoreCase("desc") 
                ? Sort.by(sortBy).descending() 
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(pageNo, pageSize, sort);
        
        Page<Auction> page = auctionRepository.findByStatus(AuctionStatus.ACTIVE, pageable);
        
        return buildPageResponse(page, "Lấy danh sách đấu giá thành công");
    }

    @Override
    public ApiResponse<PageResponse<AuctionResponse>> getAuctionsBySeller(String sellerId, int pageNo, int pageSize) {
        Pageable pageable = PageRequest.of(pageNo, pageSize, Sort.by("createdAt").descending());
        Page<Auction> page = auctionRepository.findBySellerId(sellerId, pageable);
        
        return buildPageResponse(page, "Lấy danh sách đấu giá của người bán thành công");
    }

    @Override
    public ApiResponse<PageResponse<AuctionResponse>> getAuctionsEndingSoon(int pageNo, int pageSize) {
        Pageable pageable = PageRequest.of(pageNo, pageSize);
        Page<Auction> page = auctionRepository.findActiveAuctionsEndingSoon(pageable);
        
        return buildPageResponse(page, "Lấy danh sách đấu giá sắp kết thúc thành công");
    }

    @Override
    public ApiResponse<PageResponse<AuctionResponse>> getHotAuctions(int pageNo, int pageSize) {
        Pageable pageable = PageRequest.of(pageNo, pageSize);
        Page<Auction> page = auctionRepository.findHotAuctions(pageable);
        
        return buildPageResponse(page, "Lấy danh sách đấu giá hot thành công");
    }

    @Override
    public ApiResponse<PageResponse<AuctionResponse>> searchAuctions(String keyword, int pageNo, int pageSize) {
        Pageable pageable = PageRequest.of(pageNo, pageSize, Sort.by("createdAt").descending());
        Page<Auction> page = auctionRepository.searchByKeyword(keyword, pageable);
        
        return buildPageResponse(page, "Tìm kiếm đấu giá thành công");
    }

    @Override
    public ApiResponse<PageResponse<AuctionResponse>> getMyBiddingAuctions(String userId, int pageNo, int pageSize) {
        Pageable pageable = PageRequest.of(pageNo, pageSize, Sort.by("createdAt").descending());
        Page<Auction> page = auctionRepository.findAuctionsUserBidOn(userId, pageable);
        
        return buildPageResponse(page, "Lấy danh sách đấu giá đang tham gia thành công");
    }

    @Override
    public ApiResponse<PageResponse<AuctionResponse>> getWonAuctions(String userId, int pageNo, int pageSize) {
        Pageable pageable = PageRequest.of(pageNo, pageSize, Sort.by("createdAt").descending());
        Page<Auction> page = auctionRepository.findWonAuctions(userId, pageable);
        
        return buildPageResponse(page, "Lấy danh sách đấu giá đã thắng thành công");
    }

    @Override
    public ApiResponse<PageResponse<BidResponse>> getAuctionBids(String auctionId, int pageNo, int pageSize) {
        Pageable pageable = PageRequest.of(pageNo, pageSize);
        Page<Bid> page = bidRepository.findByAuctionIdOrderByAmountDesc(auctionId, pageable);
        
        List<BidResponse> content = page.getContent().stream()
                .map(bidMapper::toResponse)
                .toList();

        PageResponse<BidResponse> pageResponse = PageResponse.<BidResponse>builder()
                .content(content)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .first(page.isFirst())
                .build();

        return ApiResponse.<PageResponse<BidResponse>>builder()
                .status(HttpStatus.OK.value())
                .message("Lấy lịch sử đấu giá thành công")
                .data(pageResponse)
                .build();
    }

    @Override
    @Transactional
    public void processEndedAuctions() {
        log.info("Processing ended auctions...");
        
        List<Auction> endedAuctions = auctionRepository.findEndedAuctions(
                AuctionStatus.ACTIVE, LocalDateTime.now());

        for (Auction auction : endedAuctions) {
            Optional<Bid> highestBid = bidRepository.findHighestBid(auction.getId());

            if (highestBid.isPresent()) {
                Bid winningBid = highestBid.get();
                
                // Check reserve price
                if (auction.getReservePrice() != null && 
                    winningBid.getAmount() < auction.getReservePrice()) {
                    auction.setStatus(AuctionStatus.NO_BIDS);
                    log.info("Auction {} ended without meeting reserve price", auction.getId());
                } else {
                    auction.setStatus(AuctionStatus.SOLD);
                    auction.setWinnerId(winningBid.getBidderId());
                    auction.setWinningBidId(winningBid.getId());
                    winningBid.setStatus(BidStatus.WON);
                    bidRepository.save(winningBid);
                    log.info("Auction {} won by user {}", auction.getId(), winningBid.getBidderId());
                }
            } else {
                auction.setStatus(AuctionStatus.NO_BIDS);
                log.info("Auction {} ended with no bids", auction.getId());
            }

            auctionRepository.save(auction);
            messageProducer.sendAuctionEndedEvent(auction);
        }
    }

    @Override
    @Transactional
    public void processStartingAuctions() {
        log.info("Processing starting auctions...");
        
        List<Auction> auctionsToStart = auctionRepository.findAuctionsToStart(
                AuctionStatus.PENDING, LocalDateTime.now());

        for (Auction auction : auctionsToStart) {
            auction.setStatus(AuctionStatus.ACTIVE);
            auctionRepository.save(auction);
            log.info("Auction {} is now active", auction.getId());
        }
    }

    private ApiResponse<PageResponse<AuctionResponse>> buildPageResponse(Page<Auction> page, String message) {
        List<AuctionResponse> content = page.getContent().stream()
                .map(auctionMapper::toResponse)
                .toList();

        PageResponse<AuctionResponse> pageResponse = PageResponse.<AuctionResponse>builder()
                .content(content)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .first(page.isFirst())
                .build();

        return ApiResponse.<PageResponse<AuctionResponse>>builder()
                .status(HttpStatus.OK.value())
                .message(message)
                .data(pageResponse)
                .build();
    }
}
