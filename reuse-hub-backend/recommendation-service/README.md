# Recommendation Service

Service gợi ý sản phẩm sử dụng Neo4j Graph Database và thuật toán Hybrid Recommendation.

## Yêu cầu

- Java 17+
- Maven 3.6+
- Neo4j Database (chạy tại `bolt://localhost:7687`)
- RabbitMQ (chạy tại `localhost:5672`)
- PostgreSQL (optional, nếu cần lưu metadata)

## Cấu hình Neo4j

1. Cài đặt Neo4j Desktop hoặc chạy Neo4j qua Docker:
```bash
docker run -d \
  --name neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/12345678 \
  neo4j:latest
```

2. Truy cập Neo4j Browser tại: http://localhost:7474
3. Đăng nhập với username: `neo4j`, password: `12345678`

## Chạy Service

### Development Mode
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### Build và chạy
```bash
mvn clean package -DskipTests
java -jar target/recommendation-service-0.0.1-SNAPSHOT.jar
```

## API Endpoints

### Lấy danh sách gợi ý
```
GET /recommendations?userId={userId}
```

**Response:**
```json
{
  "status": 200,
  "message": "Recommendations fetched successfully",
  "data": [
    {
      "itemId": "item123",
      "category": "Electronics",
      "tags": ["phone", "smartphone", "android"]
    }
  ]
}
```

## Thuật toán Recommendation

Service sử dụng **Hybrid Recommendation** kết hợp:

1. **Content-Based Filtering**: Gợi ý dựa trên category và tags tương tự
2. **Collaborative Filtering**: Gợi ý dựa trên hành vi của người dùng tương tự

### Trọng số tương tác:
- View (xem sản phẩm): 1 điểm
- Like (thích sản phẩm): 3 điểm
- Purchase (mua sản phẩm): 10 điểm

## RabbitMQ Events

Service lắng nghe các events từ RabbitMQ:

### Item Events
- **Queue**: `q.recommendation.events`
- **Exchange**: `ex.item`
- **Routing Keys**:
  - `r.item.viewed`: Khi người dùng xem sản phẩm
  - `r.item.liked`: Khi người dùng thích sản phẩm

### Transaction Events
- **Exchange**: `ex.transaction`
- **Routing Key**: `r.transaction.completed`: Khi giao dịch hoàn thành

## Kiểm tra Service

### Health Check
```bash
curl http://localhost:8088/actuator/health
```

### Test Recommendation
```bash
curl "http://localhost:8088/recommendations?userId=user123"
```

## Troubleshooting

### Lỗi kết nối Neo4j
- Kiểm tra Neo4j đang chạy: `docker ps | grep neo4j`
- Kiểm tra credentials trong `application-dev.yml`
- Test kết nối: `bolt://localhost:7687`

### Lỗi RabbitMQ
- Kiểm tra RabbitMQ đang chạy
- Kiểm tra credentials: username=`admin`, password=`admin`
- Truy cập RabbitMQ Management: http://localhost:15672

## Swagger UI

Truy cập API documentation tại: http://localhost:8088/swagger-ui.html
