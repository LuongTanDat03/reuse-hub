# Transaction Service - Bug Fixes

## 🐛 Bugs Fixed

### 1. Named Parameter Mismatch ✅
**Error**: `No argument for named parameter ':buyerId'`

**Location**: `TransactionRepository.java` line 59

**Problem**:
```java
// Query uses :buyerId
@Query("... AND t.buyerId = :buyerId ...")
// But method parameter uses @Param("userId")
boolean hasActiveTransactionForItem(@Param("itemId") String itemId, @Param("userId") String userId);
```

**Fix**:
```java
boolean hasActiveTransactionForItem(@Param("itemId") String itemId, @Param("buyerId") String buyerId);
```

---

### 2. Price Not Displayed (totalAmount vs totalPrice) ✅
**Problem**: Frontend hiển thị giá = 0 ₫

**Root Cause**:
- **Entity** (`Transaction.java`): Field tên `totalAmount` (Long)
- **Response DTO** (`TransactionResponse.java`): Field tên `totalPrice` (Double)
- **MapStruct** không tự động map vì tên khác nhau

**Fix**: Update `TransactionMapper.java`
```java
@Mapping(source = "totalAmount", target = "totalPrice")
TransactionResponse toResponse(Transaction transaction);
```

**Impact**: 
- Giá sẽ hiển thị đúng
- MapStruct sẽ tự động convert Long → Double

---

### 3. Payment Button Not Showing ✅
**Problem**: Button "Thanh toán ngay" không hiển thị cho transaction PENDING

**Root Cause**:
- Frontend chỉ check `tx.status === 'PAYMENT_PENDING'`
- Nhưng transaction mới tạo có status = `PENDING`

**Fix**: `TransactionPage.tsx`
```tsx
// Before
{tx.status === 'PAYMENT_PENDING' ? (

// After
{(tx.status === 'PENDING' || tx.status === 'PAYMENT_PENDING') ? (
```

**Logic**:
- `PENDING`: Transaction vừa tạo, chờ thanh toán
- `PAYMENT_PENDING`: Đang xử lý thanh toán
- Cả 2 status đều cần hiển thị button thanh toán

---

## 📊 Testing Checklist

After fixes, test these scenarios:

### Backend Tests:
- [ ] Create transaction → Check totalPrice in response
- [ ] Query hasActiveTransactionForItem → No error
- [ ] MapStruct mapping works correctly

### Frontend Tests:
- [ ] Transaction list shows correct price
- [ ] Button "Thanh toán ngay" appears for PENDING status
- [ ] Button "Thanh toán ngay" appears for PAYMENT_PENDING status
- [ ] Click button navigates to payment page with correct amount

---

## 🔄 Transaction Status Flow

```
PENDING (Buyer sees "Thanh toán ngay")
   ↓
PAYMENT_PENDING (Buyer sees "Thanh toán ngay")
   ↓
CONFIRMED (Seller confirms)
   ↓
IN_DELIVERY / DELIVERY (Shipping)
   ↓
COMPLETED (Buyer confirms received)
   ↓
(Optional) Buyer submits feedback
```

---

## 📝 Related Files Changed

### Backend:
1. `TransactionRepository.java` - Fixed parameter name
2. `TransactionMapper.java` - Added field mapping

### Frontend:
1. `TransactionPage.tsx` - Updated button display logic

---

## 🚀 Deployment Notes

1. **Backend**: Rebuild transaction-service
   ```bash
   cd reuse-hub-backend/transaction-service
   mvn clean install
   ```

2. **Frontend**: No rebuild needed (TypeScript only)
   ```bash
   # Just refresh browser
   ```

3. **Database**: No migration needed

---

## 🔍 Verification

### Check Price Display:
```bash
# Call API
curl -X GET "http://localhost:8084/transactions" \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Id: {userId}"

# Response should have totalPrice populated
{
  "data": {
    "content": [{
      "id": "...",
      "totalPrice": 100000.0,  // ✅ Should not be null
      ...
    }]
  }
}
```

### Check Button Display:
1. Create a new transaction
2. Go to transaction page
3. Should see "Thanh toán ngay" button
4. Click button → Should navigate to /payment page

---

## 💡 Lessons Learned

1. **Naming Consistency**: Keep field names consistent between Entity and DTO
2. **MapStruct Mapping**: Explicitly map fields with different names
3. **Status Logic**: Document status flow clearly
4. **Parameter Names**: JPA named parameters must match @Param annotations

---

**Fixed By**: Kiro AI Assistant
**Date**: November 28, 2025
**Version**: 1.0.0
