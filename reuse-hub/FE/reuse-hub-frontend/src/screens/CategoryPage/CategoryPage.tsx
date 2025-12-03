import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, Grid, List, Package } from "lucide-react";
import { Header } from "../Desktop/sections/Header/Header";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import {
  getItemsByCategory,
  getItemsByTags,
  searchItems,
  formatPrice,
  getAllCategories,
} from "../../api/item";
import { ItemSummaryResponse, Category } from "../../types/api";

export const CategoryPage = (): JSX.Element => {
  const { categoryName, tagName } = useParams<{ categoryName?: string; tagName?: string }>();
  const navigate = useNavigate();

  const [items, setItems] = useState<ItemSummaryResponse[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await getAllCategories();
        setCategories(response.data || []);
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };
    loadCategories();
  }, []);

  // Load items
  useEffect(() => {
    const loadItems = async () => {
      setLoading(true);
      try {
        let response;

        if (tagName) {
          // Load by tag
          response = await getItemsByTags([tagName], page, 20, sortBy, sortDirection);
        } else if (categoryName) {
          // Load by category
          response = await getItemsByCategory(categoryName, page, 20, sortBy, sortDirection);
        } else {
          // Load all
          response = await getItemsByCategory("tat-ca-san-pham", page, 20, sortBy, sortDirection);
        }

        setItems(response.data.content);
        setTotalPages(response.data.totalPages);
        setHasMore(!response.data.last);
      } catch (error) {
        console.error("Error loading items:", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [categoryName, tagName, page, sortBy, sortDirection]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await searchItems(
        { keyword: searchQuery },
        0,
        20,
        sortBy,
        sortDirection
      );
      setItems(response.data.content);
      setTotalPages(response.data.totalPages);
      setPage(0);
    } catch (error) {
      console.error("Error searching items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (slug: string) => {
    navigate(`/category/${slug}`);
  };

  const getCurrentCategoryName = () => {
    if (tagName) return `Tag: ${tagName}`;
    if (categoryName === "tat-ca-san-pham") return "Tất cả sản phẩm";
    const category = categories.find((c) => c.slug === categoryName);
    return category?.name || "Danh mục";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <button onClick={() => navigate("/")} className="hover:text-blue-600">
            Trang chủ
          </button>
          <span>/</span>
          <span className="text-gray-900 font-medium">{getCurrentCategoryName()}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <SlidersHorizontal className="w-5 h-5" />
                  <h3 className="font-semibold text-lg">Bộ lọc</h3>
                </div>

                {/* Categories */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-700 mb-3">Danh mục</h4>
                  <button
                    onClick={() => handleCategoryChange("tat-ca-san-pham")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                      categoryName === "tat-ca-san-pham" || !categoryName
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    Tất cả sản phẩm
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category.slug)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                        categoryName === category.slug
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>

                {/* Sort Options */}
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-medium text-sm text-gray-700 mb-3">Sắp xếp</h4>
                  <select
                    value={`${sortBy}-${sortDirection}`}
                    onChange={(e) => {
                      const [newSortBy, newDirection] = e.target.value.split("-");
                      setSortBy(newSortBy);
                      setSortDirection(newDirection);
                      setPage(0);
                    }}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="createdAt-desc">Mới nhất</option>
                    <option value="createdAt-asc">Cũ nhất</option>
                    <option value="price-asc">Giá thấp đến cao</option>
                    <option value="price-desc">Giá cao đến thấp</option>
                    <option value="viewCount-desc">Xem nhiều nhất</option>
                    <option value="likeCount-desc">Thích nhiều nhất</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search & View Toggle */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch}>
                  <Search className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-4 text-sm text-gray-600">
              Tìm thấy <span className="font-medium text-gray-900">{items.length}</span> sản phẩm
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-0">
                      <div className="aspect-square bg-gray-200"></div>
                      <div className="p-3 space-y-2">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : items.length === 0 ? (
              /* Empty State */
              <Card>
                <CardContent className="p-12 text-center">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Không tìm thấy sản phẩm
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác
                  </p>
                  <Button onClick={() => navigate("/")}>Về trang chủ</Button>
                </CardContent>
              </Card>
            ) : (
              /* Items Grid/List */
              <>
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                      : "space-y-4"
                  }
                >
                  {items.map((item) =>
                    viewMode === "grid" ? (
                      /* Grid View */
                      <Card
                        key={item.id}
                        className="cursor-pointer hover:shadow-lg transition group"
                        onClick={() => navigate(`/product/${item.id}`)}
                      >
                        <CardContent className="p-0">
                          <div className="aspect-square bg-gray-100 overflow-hidden">
                            {item.images && item.images[0] ? (
                              <img
                                src={item.images[0]}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-12 h-12 text-gray-300" />
                              </div>
                            )}
                          </div>
                          <div className="p-3">
                            <h3 className="font-medium text-sm text-gray-900 line-clamp-2 mb-1">
                              {item.title}
                            </h3>
                            <div className="text-blue-600 font-bold text-sm mb-1">
                              {formatPrice(item.price)}
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{item.viewCount} lượt xem</span>
                              <span
                                className={`px-2 py-0.5 rounded ${
                                  item.status === "AVAILABLE"
                                    ? "bg-green-50 text-green-700"
                                    : "bg-gray-50 text-gray-700"
                                }`}
                              >
                                {item.status === "AVAILABLE" ? "Còn hàng" : "Đã bán"}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      /* List View */
                      <Card
                        key={item.id}
                        className="cursor-pointer hover:shadow-lg transition"
                        onClick={() => navigate(`/product/${item.id}`)}
                      >
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <div className="w-32 h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                              {item.images && item.images[0] ? (
                                <img
                                  src={item.images[0]}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-8 h-8 text-gray-300" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                                {item.title}
                              </h3>
                              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                                {item.description}
                              </p>
                              <div className="flex items-center justify-between">
                                <div className="text-blue-600 font-bold text-lg">
                                  {formatPrice(item.price)}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <span>{item.viewCount} lượt xem</span>
                                  <span>{item.likeCount} lượt thích</span>
                                  <span
                                    className={`px-3 py-1 rounded ${
                                      item.status === "AVAILABLE"
                                        ? "bg-green-50 text-green-700"
                                        : "bg-gray-50 text-gray-700"
                                    }`}
                                  >
                                    {item.status === "AVAILABLE" ? "Còn hàng" : "Đã bán"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                    >
                      Trước
                    </Button>
                    <div className="flex items-center gap-2">
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        const pageNum = page < 3 ? i : page - 2 + i;
                        if (pageNum >= totalPages) return null;
                        return (
                          <Button
                            key={pageNum}
                            variant={page === pageNum ? "default" : "outline"}
                            onClick={() => setPage(pageNum)}
                          >
                            {pageNum + 1}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={!hasMore}
                    >
                      Sau
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
