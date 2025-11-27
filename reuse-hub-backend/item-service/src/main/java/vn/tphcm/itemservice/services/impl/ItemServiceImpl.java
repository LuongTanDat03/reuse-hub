/*
 * @ (#) ItemServiceImpl.java       1.0     9/18/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.itemservice.services.impl;
/*
 * @author: Luong Tan Dat
 * @date: 9/18/2025
 */

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import vn.tphcm.event.dto.EventMessage;
import vn.tphcm.event.dto.FeedbackEvent;
import vn.tphcm.event.dto.NotificationMessage;
import vn.tphcm.itemservice.commons.InteractionType;
import vn.tphcm.itemservice.commons.ItemStatus;
import vn.tphcm.itemservice.dtos.ApiResponse;
import vn.tphcm.itemservice.dtos.PageResponse;
import vn.tphcm.itemservice.dtos.request.ItemCreationRequest;
import vn.tphcm.itemservice.dtos.request.ItemSearchRequest;
import vn.tphcm.itemservice.dtos.request.ItemUpdateRequest;
import vn.tphcm.itemservice.dtos.response.CommentResponse;
import vn.tphcm.itemservice.dtos.response.ImageUploadResponse;
import vn.tphcm.itemservice.dtos.response.ItemResponse;
import vn.tphcm.itemservice.dtos.response.ItemStatisticsResponse;
import vn.tphcm.itemservice.exceptions.InvalidDataException;
import vn.tphcm.itemservice.exceptions.ResourceNotFoundException;
import vn.tphcm.itemservice.mapper.ItemCommentMapper;
import vn.tphcm.itemservice.mapper.ItemMapper;
import vn.tphcm.itemservice.mapper.ItemRatingMapper;
import vn.tphcm.itemservice.models.*;
import vn.tphcm.itemservice.repositories.*;
import vn.tphcm.itemservice.services.CacheService;
import vn.tphcm.itemservice.services.ItemService;
import vn.tphcm.itemservice.services.MessageProducer;
import vn.tphcm.itemservice.services.SupabaseStorageService;

import java.time.OffsetDateTime;
import java.util.*;

import static org.springframework.http.HttpStatus.CREATED;
import static org.springframework.http.HttpStatus.OK;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "ITEM-SERVICE")
public class ItemServiceImpl implements ItemService {
    private final ItemRepository itemRepository;
    private final ItemInteractionRepository itemInteractionRepository;
    private final ItemMapper itemMapper;
    private final ItemCommentMapper itemCommentMapper;
    private final ItemRatingMapper itemRatingMapper;
    private final CacheService cacheService;
    private final MessageProducer messageProducer;
    private final SupabaseStorageService storageService;
    private final ItemRatingRepository itemRatingRepository;
    private final ItemCommentRepository itemCommentRepository;
    private final CategoryRepository categoryRepository;

    @Override
    @Transactional
    public ApiResponse<ItemResponse> createItem(ItemCreationRequest request, String userId, List<MultipartFile> images) {
        log.info("Creating item for userId: {}", userId);

        Item item = itemMapper.toItem(request);
        item.setUserId(userId);
        item.setViewCount(0);
        item.setLikeCount(0);
        item.setCommentCount(0);
        item.setComments(new ArrayList<>());
        item.setRatings(new ArrayList<>());
        setImagesUrl(item, images);

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> {
                    log.error("Category with id: {} not found", request.getCategoryId());
                    return new ResourceNotFoundException("Category not found");
                });

        item.setCategory(category);

        Item savedItem = itemRepository.save(item);
        ItemResponse itemResponse = itemMapper.toResponse(savedItem);

        log.info("Saving item with id: {} for userId: {}", savedItem.getId(), userId);

        invalidateCachesOnItemChange(userId);

        // Cache the newly created item
        cacheService.cacheItem(savedItem.getId(), itemResponse);

        // Publish item created event
        EventMessage event = EventMessage.builder()
                .eventId(UUID.randomUUID().toString())
                .eventType("ITEM_CREATED")
                .itemId(savedItem.getId())
                .itemTitle(savedItem.getTitle())
                .actorUserId(userId)
                .itemOwnerId(savedItem.getUserId())
                .category(savedItem.getCategory().getName())
                .images(savedItem.getImages())
                .build();

        messageProducer.publishItemEvent(event);

        return ApiResponse.<ItemResponse>builder()
                .status(CREATED.value())
                .message("Item created successfully")
                .data(itemResponse)
                .timestamp(OffsetDateTime.now())
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<ItemResponse> updateItem(ItemUpdateRequest request, String itemId, String userId, List<MultipartFile> images) {
        Item item = getItemIfExists(itemId);

        if (!item.getUserId().equals(userId)) {
            log.error("User with id: {} is not authorized to update item with id: {}", userId, itemId);
            throw new InvalidDataException("You don't have permission to update this item");
        }

        itemMapper.updateItem(item, request);

        if (request.getCategoryId() != null) {
             Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
             item.setCategory(category);
        }

        setImagesUrl(item, images);

        Item savedItem = itemRepository.save(item);

        ItemResponse response = itemMapper.toResponse(savedItem);

        invalidateCachesOnItemChange(userId);

        cacheService.cacheItem(itemId, response);

        EventMessage event = EventMessage.builder()
                .eventId(UUID.randomUUID().toString())
                .eventType("ITEM_UPDATED")
                .itemId(savedItem.getId())
                .itemTitle(savedItem.getTitle())
                .actorUserId(userId)
                .itemOwnerId(savedItem.getUserId())
                .category(savedItem.getCategory().getName())
                .images(savedItem.getImages())
                .tags(savedItem.getTags())
                .build();

        messageProducer.publishItemEvent(event);

        return ApiResponse.<ItemResponse>builder()
                .status(OK.value())
                .message("Item successfully updated")
                .data(response)
                .timestamp(OffsetDateTime.now())
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<Void> deleteItem(String itemId, String userId) {
        Item item = getItemIfExists(itemId);

        if (!item.getUserId().equals(userId)) {
            log.error("User with id: {} is not authorized to delete item with id: {}", userId, itemId);
            throw new InvalidDataException("You don't have permission to delete this item");
        }

        item.setStatus(ItemStatus.DELETED);
        itemRepository.save(item);

        log.info("Item with id: {} has been marked as DELETED by user with id: {}", itemId, userId);

        cacheService.evictCachedItem(itemId);

        invalidateCachesOnItemChange(userId);

        return ApiResponse.<Void>builder()
                .status(OK.value())
                .message("Item successfully deleted")
                .timestamp(OffsetDateTime.now())
                .build();
    }

    @Override
    public ApiResponse<ItemResponse> getItemById(String itemId, String currentUserId) {
        ItemResponse cachedItem = cacheService.getCachedItem(itemId);
        if (cachedItem != null){
            log.info("Cache Hit:Returning cached item with id: {}", itemId);
            if (currentUserId != null && !cachedItem.getUserId().equals(currentUserId)) {
                Long newViewCount = cacheService.incrementItemViewCount(itemId);
                if (newViewCount != null) {
                    cachedItem.setViewCount(newViewCount.intValue());
                }
                publishViewCount(cachedItem, currentUserId);
            }
            return ApiResponse.<ItemResponse>builder()
                    .message("Item fetched by Id successfully")
                    .status(OK.value())
                    .data(cachedItem)
                    .timestamp(OffsetDateTime.now())
                    .build();
        }

        Item item = getItemIfExists(itemId);

        if (currentUserId != null && !item.getUserId().equals(currentUserId)) {
            log.info("Incrementing view count for item with id: {}", itemId);

            countView(item, currentUserId);

            publishViewCount(itemMapper.toResponse(item), currentUserId);
        }

        ItemResponse response = itemMapper.toResponse(item);

        cacheService.cacheItem(itemId, response);

        return ApiResponse.<ItemResponse>builder()
                .status(OK.value())
                .message("Item fetched successfully")
                .data(response)
                .timestamp(OffsetDateTime.now())
                .build();
    }

    @Override
    public ApiResponse<Void> likeItem(String itemId, String userId) {
        Item item = getItemIfExists(itemId);

        Optional<ItemInteraction> existingLike = itemInteractionRepository.findByItemAndUserIdAndInteractionType(item, userId, InteractionType.LIKE);

        if (existingLike.isPresent()) {
            return ApiResponse.<Void>builder()
                    .status(OK.value())
                    .message("You have already liked this item")
                    .timestamp(OffsetDateTime.now())
                    .build();
        }

        createInteraction(item, userId, InteractionType.LIKE);

        item.setLikeCount(item.getLikeCount() + 1);
        itemRepository.save(item);

        cacheService.evictCachedItem(itemId);

        EventMessage event = EventMessage.builder()
                .eventId(UUID.randomUUID().toString())
                .eventType("ITEM_LIKED")
                .itemId(item.getId())
                .itemTitle(item.getTitle())
                .actorUserId(userId)
                .itemOwnerId(item.getUserId())
                .category(item.getCategory().getName())
                .images(item.getImages())
                .tags(item.getTags())
                .build();

        messageProducer.publishItemEvent(event);

        if (!item.getUserId().equals(userId)) {
            NotificationMessage notification = NotificationMessage.builder()
                    .notificationId(UUID.randomUUID().toString())
                    .recipientUserId(item.getUserId())
                    .title("Item Liked")
                    .message("Someone liked your item: " + item.getTitle())
                    .type("ITEM_LIKED")
                    .itemId(item.getId())
                    .actorUserId(userId)
                    .data(Map.of("itemTitle", item.getTitle(), "category", item.getCategory()))
                    .build();

            messageProducer.publishNotification(notification);
        }

        return ApiResponse.<Void>builder()
                .status(OK.value())
                .message("Item liked successfully")
                .timestamp(OffsetDateTime.now())
                .build();
    }

    @Override
    public ApiResponse<Void> unlikeItem(String itemId, String userId) {
        Item item = getItemIfExists(itemId);

        Optional<ItemInteraction> existingUnlike = itemInteractionRepository.findByItemAndUserIdAndInteractionType(item, userId, InteractionType.UNLIKE);

        if (existingUnlike.isPresent()) {
            return ApiResponse.<Void>builder()
                    .status(OK.value())
                    .message("You have already unliked this item")
                    .timestamp(OffsetDateTime.now())
                    .build();
        }

        createInteraction(item, userId, InteractionType.UNLIKE);

        item.setLikeCount(Math.max(0, item.getLikeCount() - 1));
        itemRepository.save(item);

        cacheService.evictCachedItem(itemId);

        EventMessage event = EventMessage.builder()
                .eventId(UUID.randomUUID().toString())
                .eventType("ITEM_UNLIKED")
                .itemId(item.getId())
                .itemTitle(item.getTitle())
                .actorUserId(userId)
                .itemOwnerId(item.getUserId())
                .category(item.getCategory().getName())
                .images(item.getImages())
                .tags(item.getTags())
                .build();

        messageProducer.publishItemEvent(event);

        if (!item.getUserId().equals(userId)) {
            NotificationMessage notification = NotificationMessage.builder()
                    .notificationId(UUID.randomUUID().toString())
                    .recipientUserId(item.getUserId())
                    .title("Item Unliked")
                    .message("Someone unliked your item: " + item.getTitle())
                    .type("ITEM_UNLIKED")
                    .itemId(item.getId())
                    .actorUserId(userId)
                    .data(Map.of("itemTitle", item.getTitle(), "category", item.getCategory()))
                    .build();

            messageProducer.publishNotification(notification);
        }

        return ApiResponse.<Void>builder()
                .status(OK.value())
                .message("Item Unliked successfully")
                .timestamp(OffsetDateTime.now())
                .build();
    }

    @Override
    public ApiResponse<PageResponse<ItemResponse>> getAllItems(int pageNo, int pageSize, String sortBy, String sortDirection) {
        log.info("Fetching all items with pageNo: {}, pageSize: {}, sortBy: {}, sortDirection: {}", pageNo, pageSize, sortBy, sortDirection);

        PageResponse<ItemResponse> cachedItems = cacheService.getCachedAllItems(pageNo, pageSize, sortBy, sortDirection);

        if (cachedItems != null && !cachedItems.getContent().isEmpty()) {
            log.info("Returning cached all items");

            return ApiResponse.<PageResponse<ItemResponse>>builder()
                    .status(OK.value())
                    .message("All item fetched successfully")
                    .data(cachedItems)
                    .timestamp(OffsetDateTime.now())
                    .build();
        }

        Pageable pageable = createPageable(pageNo, pageSize, sortBy, sortDirection);

        Page<Item> itemsPage = itemRepository.findByStatus(ItemStatus.AVAILABLE, pageable);

        Page<ItemResponse> responsePage = itemsPage.map(itemMapper::toResponse);

        PageResponse<ItemResponse> pageResponse = createPageResponse(responsePage);

        cacheService.cacheAllItems(pageNo, pageSize, sortBy, sortDirection, pageResponse);

        return ApiResponse.<PageResponse<ItemResponse>>builder()
                .status(OK.value())
                .message("All item fetched successfully")
                .data(pageResponse)
                .timestamp(OffsetDateTime.now())
                .build();
    }

    @Override
    public ApiResponse<PageResponse<ItemResponse>> getMyItem(String userId, int pageNo, int pageSize, String sortBy, String sortDirection) {
        log.info("Fetching items for userId: {} with pageNo: {}, pageSize: {}, sortBy: {}, sortDirection: {}", userId, pageNo, pageSize, sortBy, sortDirection);

        PageResponse<ItemResponse> cachedItems = cacheService.getCachedUserItems(userId, pageNo, pageSize, sortBy, sortDirection);

        if (cachedItems != null && !cachedItems.getContent().isEmpty()) {
            log.info("Returning cached items for userId: {}", userId);

            return ApiResponse.<PageResponse<ItemResponse>>builder()
                    .status(OK.value())
                    .message("My items fetched successfully")
                    .data(cachedItems)
                    .timestamp(OffsetDateTime.now())
                    .build();
        }

        Pageable pageable = createPageable(pageNo, pageSize, sortBy, sortDirection);

        Page<Item> itemsPage = itemRepository.findByUserIdAndStatusNot(userId, ItemStatus.DELETED, pageable);

        Page<ItemResponse> responsePage = itemsPage.map(itemMapper::toResponse);

        PageResponse<ItemResponse> pageResponse = createPageResponse(responsePage);

        cacheService.cacheUserItems(userId, pageResponse, pageNo, pageSize, sortBy, sortDirection);

        return ApiResponse.<PageResponse<ItemResponse>>builder()
                .status(OK.value())
                .message("My items fetched successfully")
                .data(pageResponse)
                .timestamp(OffsetDateTime.now())
                .build();
    }

    @Override
    public ApiResponse<PageResponse<ItemResponse>> searchItems(ItemSearchRequest request, int pageNo, int pageSize, String sortBy, String sortDirection) {
        log.info("Searching items with keyword: {}", request.getKeyword());

        Pageable pageable = createPageable(pageNo, pageSize, sortBy, sortDirection);

        Page<Item> items = itemRepository.findByKeyword(request.getKeyword(), pageable);

        PageResponse<ItemResponse> responsePage = createPageResponse(items.map(itemMapper::toResponse));
        return ApiResponse.<PageResponse<ItemResponse>>builder()
                .status(OK.value())
                .message("Items searched successfully")
                .data(responsePage)
                .timestamp(OffsetDateTime.now())
                .build();
    }

    @Override
    public ApiResponse<PageResponse<ItemResponse>> getPopularItems(int pageNo, int pageSize, String sortBy, String sortDirection) {
        log.info("Fetching popular items with pageNo: {}, pageSize: {}, sortBy: {}, sortDirection: {}", pageNo, pageSize, sortBy, sortDirection);

        PageResponse<ItemResponse> cachedItems = cacheService.getCachedPopularItems();

        if (cachedItems != null && !cachedItems.getContent().isEmpty()) {
            log.info("Returning cached popular items");

            return ApiResponse.<PageResponse<ItemResponse>>builder()
                    .status(OK.value())
                    .message("Popular items fetched successfully")
                    .data(cachedItems)
                    .timestamp(OffsetDateTime.now())
                    .build();
        }

        Pageable pageable = createPageable(pageNo, pageSize, sortBy, sortDirection);

        Page<Item> itemsPage = itemRepository.findPopularItemsByStatus(ItemStatus.AVAILABLE, pageable);

        Page<ItemResponse> responses = itemsPage.map(itemMapper::toResponse);

        PageResponse<ItemResponse> pageResponse = createPageResponse(responses);
        cacheService.cachePopularItems(pageResponse);

        return ApiResponse.<PageResponse<ItemResponse>>builder()
                .status(OK.value())
                .message("Popular items fetched successfully")
                .data(pageResponse)
                .timestamp(OffsetDateTime.now())
                .build();
    }

    @Override
    public ApiResponse<PageResponse<ItemResponse>> getItemsByCategory(String categorySlug, int pageNo, int pageSize, String sortBy, String sortDirection) {
        log.info("Fetching items by category: {} with pageNo: {}, pageSize: {}, sortBy: {}, sortDirection: {}", categorySlug, pageNo, pageSize, sortBy, sortDirection);

        Pageable pageable = createPageable(pageNo, pageSize, sortBy, sortDirection);

        Page<Item> itemsPage = itemRepository.findByCategoryAndStatus(categorySlug, ItemStatus.AVAILABLE, pageable);

        Page<ItemResponse> responsePage = itemsPage.map(itemMapper::toResponse);

        PageResponse<ItemResponse> pageResponse = createPageResponse(responsePage);

        return ApiResponse.<PageResponse<ItemResponse>>builder()
                .status(OK.value())
                .message("Items by category fetched successfully")
                .data(pageResponse)
                .timestamp(OffsetDateTime.now())
                .build();
    }

    @Override
    public ApiResponse<PageResponse<CommentResponse>> getItemComments(String itemId, int pageNo, int pageSize, String sortBy, String sortDirection) {
        log.info("Fetching comments for item with id: {}", itemId);

        if (!itemRepository.existsById(itemId)) {
            throw new ResourceNotFoundException("Item not found");
        }

        Pageable pageable = createPageable(pageNo, pageSize, sortBy, sortDirection);

        Page<ItemComment> commentsPage = itemCommentRepository.findByItemId(itemId, pageable);

        Page<CommentResponse> responsePage = commentsPage.map(itemCommentMapper::toCommentResponse);

        PageResponse<CommentResponse> pageResponse = createPageResponse(responsePage);
        return ApiResponse.<PageResponse<CommentResponse>>builder()
                .status(OK.value())
                .message("Item comments fetched successfully")
                .data(pageResponse)
                .timestamp(OffsetDateTime.now())
                .build();
    }


    @Override
    public ApiResponse<ItemResponse> getItemFeignById(String itemId) {
        Item item = getItemIfExists(itemId);

        return ApiResponse.<ItemResponse>builder()
                .status(OK.value())
                .message("Item fetched successfully")
                .data(itemMapper.toResponse(item))
                .timestamp(OffsetDateTime.now())
                .build();
    }

    @Override
    public ApiResponse<PageResponse<ItemResponse>> searchItemsNearby(double latitude, double longitude, double radius, int pageNo, int pageSize, String sortBy, String sortDirection) {
        log.info("Searching items nearby latitude: {}, longitude: {}, radius: {}", latitude, longitude, radius);

        Pageable pageable = createPageable(pageNo, pageSize, sortBy, sortDirection);

        Page<Item> items = itemRepository.searchItemNearby(latitude, longitude, radius, pageable);

        Page<ItemResponse> responsePage = items.map(itemMapper::toResponse);

        PageResponse<ItemResponse> pageResponse = createPageResponse(responsePage);

        return ApiResponse.<PageResponse<ItemResponse>>builder()
                .status(OK.value())
                .data(pageResponse)
                .message("Nearby items fetched successfully")
                .build();
    }

    @Override
    public ApiResponse<PageResponse<ItemResponse>> getItemsByTags(List<String> tags, int pageNo, int pageSize, String sortBy, String sortDirection) {
        log.info("Search for items by tags: {}", tags);

        List<String> tagsCleaned = tags.stream().map(tag -> tag.trim().toLowerCase()).toList();

        Pageable pageable = createPageable(pageNo, pageSize, sortBy, sortDirection);

        Page<Item> items = itemRepository.findByTagsInAndStatusAvailable(tagsCleaned, pageable);

        Page<ItemResponse> responsePage = items.map(itemMapper::toResponse);

        PageResponse<ItemResponse> pageResponse = createPageResponse(responsePage);

        return ApiResponse.<PageResponse<ItemResponse>>builder()
                .status(OK.value())
                .data(pageResponse)
                .message("Items fetched successfully")
                .build();
    }

    @Override
    public ApiResponse<PageResponse<ItemResponse>> getItems(int pageNo, int pageSize, String sortBy, String sortDirection, String filter) {
        Pageable pageable = createPageable(pageNo, pageSize, sortBy, sortDirection);

        Page<Item> items = itemRepository.findAllPage(filter, pageable);

        Page<ItemResponse> responsePage = items.map(itemMapper::toResponse);

        PageResponse<ItemResponse> pageResponse = createPageResponse(responsePage);

        return ApiResponse.<PageResponse<ItemResponse>>builder()
                .status(OK.value())
                .data(pageResponse)
                .message("Items fetched successfully")
                .build();
    }

    @Override
    public void processItemBoost(String itemId) {
        if (itemId == null || itemId.isBlank()) {
            log.error("SAGA: Invalid itemId for boost: {}", itemId);
            return;
        }

        log.info("SAGA: Processing item boost for itemId: {}", itemId);
        Item item = getItemIfExists(itemId);

        item.setPremium(true);
        Item savedItem = itemRepository.save(item);

        log.info("SAGA: Item {} successfully boosted ", savedItem.getId());

        cacheService.cacheItem(itemId, itemMapper.toResponse(savedItem));
        cacheService.evictAllItems();
        cacheService.evictCachedPopularItems();
    }

    @Override
    @Transactional
    public void processNewFeedback(FeedbackEvent event) {
        log.info("SAGA: Processing new feedback event for itemId: {}", event.getItemId());

        Item item = getItemIfExists(event.getItemId());

        ItemRating rating = ItemRating.builder()
                .item(item)
                .userId(event.getReviewerId())
                .rating(event.getRating())
                .build();

        itemRatingRepository.save(rating);

        if (event.getComment() != null && !event.getComment().isBlank()) {
            ItemComment comment = ItemComment.builder()
                    .item(item)
                    .userId(event.getReviewerId())
                    .comment(event.getComment())
                    .build();

            itemCommentRepository.save(comment);
        }

        Integer totalRatings = itemRatingRepository.countRatingsByItemId(item.getId());
        Double averageRating = itemRatingRepository.calculateAverageRating(item.getId());
        long commentCount = itemCommentRepository.countByItemId(item.getId());

        Item savedItem = itemRepository.save(item);
        log.info("SAGA: Updated item {} with new rating info. Total Ratings: {}, Average Rating: {}, Comment Count: {}",
                savedItem.getId(), totalRatings, averageRating, commentCount);

        cacheService.cacheItem(item.getId(), itemMapper.toResponse(savedItem));

        invalidateCachesOnItemChange(item.getUserId());
    }

    @Override
    public void updateItemTagsFromAi(String itemId, List<String> tags) {
        log.info("SAGA: Updating tags for item {} from AI result.", itemId);

        Item item = getItemIfExists(itemId);

        Set<String> currentTags = new HashSet<>();
        if (item.getTags() != null) {
            currentTags.addAll(item.getTags());
        }
        currentTags.addAll(tags);

        item.setTags(new ArrayList<>(currentTags));
        itemRepository.save(item);

        cacheService.evictAllRelatedCaches(itemId, item.getUserId());

        log.info("SAGA: Tags updated successfully. New tags: {}", item.getTags());
    }

    @Override
    public ApiResponse<ItemStatisticsResponse> getItemStatistics() {
        List<Object[]> results = itemRepository.countItemsByStatus();
        Map<String, Long> stats = new HashMap<>();
        for (Object[] result : results) {
            stats.put(result[0].toString(), (Long) result[1]);
        }
        return ApiResponse.<ItemStatisticsResponse>builder()
                .status(OK.value())
                .message("Item statistics fetched successfully")
                .data(ItemStatisticsResponse.builder()
                        .totalItems(results.stream().mapToLong(s -> (Long) s[1]).sum())
                        .itemStats(stats)
                        .build())
                .build();
    }

    @Override
    public ApiResponse<Void> deleteItemForAdmin(String itemId) {
        log.info("Delete item for itemId: {}", itemId);

        Item item = getItemIfExists(itemId);

        item.setStatus(ItemStatus.DELETED);

        cacheService.evictCachedItem(itemId);


        itemRepository.save(item);

        return ApiResponse.<Void>builder()
                .status(OK.value())
                .data(null)
                .message("Item successfully deleted by admin")
                .timestamp(OffsetDateTime.now())
                .build();
    }


    private Item getItemIfExists(String itemId) {
        log.info("Fetching item with id: {}", itemId);

        return itemRepository.findById(itemId).orElseThrow(() -> {
            log.error("Item with id: {} not found", itemId);
            return new ResourceNotFoundException("Item not found");
        });
    }

    private void createInteraction(Item item, String userId, InteractionType type) {
        ItemInteraction interaction = new ItemInteraction();
        interaction.setItem(item);
        interaction.setUserId(userId);
        interaction.setInteractionType(type);
        itemInteractionRepository.save(interaction);
    }

    private void publishViewCount(ItemResponse response, String currentUserId) {
        if (currentUserId == null || response.getUserId().equals(currentUserId)) {
            return;
        }

        EventMessage event = EventMessage.builder()
                .eventId(UUID.randomUUID().toString())
                .eventType("ITEM_VIEWED")
                .itemId(response.getId())
                .itemTitle(response.getTitle())
                .actorUserId(currentUserId)
                .itemOwnerId(response.getUserId())
                .category(response.getCategory())
                .tags(response.getTags())
                .build();

        messageProducer.publishItemEvent(event);
    }

    private void countView(Item item, String currentUserId) {
        if (item == null || currentUserId == null || item.getUserId().equals(currentUserId)) {
            return;
        }

        item.setViewCount(item.getViewCount() + 1);

        itemRepository.save(item);

        createInteraction(item, currentUserId, InteractionType.VIEW);
    }

    private Pageable createPageable(int pageNo, int pageSize, String sortBy, String sortDirection) {
        Sort.Direction direction = "ASC".equalsIgnoreCase(sortDirection)
                ? Sort.Direction.ASC : Sort.Direction.DESC;

        Sort sort = Sort.by(direction, sortBy != null ? sortBy : "createdAt");
        return PageRequest.of(pageNo, pageSize, sort);
    }

    private void invalidateCachesOnItemChange(String userId) {
        cacheService.evictAllUserItems(userId);
        cacheService.evictAllItems();
        cacheService.evictCachedPopularItems();
    }

    private void setImagesUrl(Item item, List<MultipartFile> images) {
        if (images != null && !images.isEmpty()) {
            List<ImageUploadResponse> imageUrls = storageService.uploadImages(images, "/images");

            log.info("Uploaded {} images for item with url: {}", imageUrls.size(), imageUrls.get(0).getImageUrl());

            List<String> urls = imageUrls.stream()
                    .map(ImageUploadResponse::getImageUrl)
                    .toList();

            item.setImages(urls);
        }
    }

    private <T> PageResponse<T> createPageResponse(Page<T> page) {
        return PageResponse.<T>builder()
                .content(page.getContent())
                .pageNo(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }
}
