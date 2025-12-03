import { Link } from 'react-router-dom';
import { formatPrice } from '../api/item';

interface ChatProductCardProps {
  itemId: string;
  itemTitle?: string;
  itemThumbnail?: string;
  itemPrice?: number;
}

export default function ChatProductCard({
  itemId,
  itemTitle,
  itemThumbnail,
  itemPrice,
}: ChatProductCardProps) {
  if (!itemId) return null;

  return (
    <Link to={`/product/${itemId}`} className="block mt-2">
      <div className="bg-white border border-gray-200 rounded-lg p-3 max-w-[280px] hover:shadow-md transition-shadow">
        {itemThumbnail && (
          <img
            src={itemThumbnail}
            alt={itemTitle || 'Product'}
            className="w-full h-32 object-cover rounded mb-2"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder-image.png';
            }}
          />
        )}
        <div className="space-y-1">
          {itemTitle && (
            <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
              {itemTitle}
            </h4>
          )}
          {itemPrice !== undefined && (
            <p className="text-base font-bold text-blue-600">
              {formatPrice(itemPrice)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}



