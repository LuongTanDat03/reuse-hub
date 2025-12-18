import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Layout } from '../../components/Layout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useAuth } from '../../contexts/AuthContext';
import { getMyKyc, submitKyc, resubmitKyc } from '../../api/kyc';
import {
  KycResponse,
  KycSubmitRequest,
  DocumentType,
  DOCUMENT_TYPES,
  getKycStatusLabel,
  getKycStatusColor,
  getDocumentTypeLabel,
} from '../../types/kyc';
import { Shield, Upload, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

export const KycPage: React.FC = () => {
  const { user } = useAuth();
  const [kyc, setKyc] = useState<KycResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [documentType, setDocumentType] = useState<DocumentType>('CCCD');
  const [documentNumber, setDocumentNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [selfieImage, setSelfieImage] = useState<File | null>(null);

  // Preview URLs
  const [frontPreview, setFrontPreview] = useState<string>('');
  const [backPreview, setBackPreview] = useState<string>('');
  const [selfiePreview, setSelfiePreview] = useState<string>('');

  useEffect(() => {
    if (user) {
      loadKyc();
    }
  }, [user]);

  const loadKyc = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await getMyKyc(user.id);
      if (response.status === 200) {
        setKyc(response.data);
        if (!response.data) {
          setShowForm(true);
        }
      }
    } catch (error) {
      console.error('Error loading KYC:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setImage: (file: File | null) => void,
    setPreview: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    // Validate full name
    if (!fullName || fullName.trim().length < 3) {
      toast.error('Họ tên phải có ít nhất 3 ký tự');
      return false;
    }

    if (fullName.length > 255) {
      toast.error('Họ tên không được vượt quá 255 ký tự');
      return false;
    }

    // Validate document number
    const docNum = documentNumber.trim().toUpperCase();
    switch (documentType) {
      case 'CCCD':
        if (!/^\d{12}$/.test(docNum)) {
          toast.error('CCCD phải gồm 12 chữ số (ví dụ: 123456789012)');
          return false;
        }
        break;
      case 'CMND':
        if (!/^\d{9}$/.test(docNum)) {
          toast.error('CMND phải gồm 9 chữ số (ví dụ: 123456789)');
          return false;
        }
        break;
      case 'PASSPORT':
        if (!/^[A-Z]{1,2}\d{6,9}$/.test(docNum)) {
          toast.error('Hộ chiếu phải bắt đầu bằng 1-2 chữ cái theo sau là 6-9 chữ số (ví dụ: AB123456)');
          return false;
        }
        break;
      case 'DRIVER_LICENSE':
        if (!/^[A-Z0-9]{6,12}$/.test(docNum)) {
          toast.error('Bằng lái xe phải gồm 6-12 ký tự chữ và số (ví dụ: DL123456)');
          return false;
        }
        break;
    }

    // Validate images
    if (!frontImage && !kyc) {
      toast.error('Vui lòng tải lên ảnh mặt trước giấy tờ');
      return false;
    }

    const validateImage = (file: File | null, name: string): boolean => {
      if (!file) return true;

      // Check file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${name} không được vượt quá 5MB`);
        return false;
      }

      // Check file type
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error(`${name} phải là ảnh (JPEG, PNG hoặc WebP)`);
        return false;
      }

      // Check file extension
      const filename = file.name.toLowerCase();
      if (!filename.endsWith('.jpg') && !filename.endsWith('.jpeg') && 
          !filename.endsWith('.png') && !filename.endsWith('.webp')) {
        toast.error(`${name} phải có đuôi .jpg, .jpeg, .png hoặc .webp`);
        return false;
      }

      return true;
    };

    if (!validateImage(frontImage, 'Ảnh mặt trước')) return false;
    if (!validateImage(backImage, 'Ảnh mặt sau')) return false;
    if (!validateImage(selfieImage, 'Ảnh selfie')) return false;

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const request: KycSubmitRequest = {
        documentType,
        documentNumber,
        fullName,
        dateOfBirth: dateOfBirth || undefined,
        address: address || undefined,
      };

      let response;
      if (kyc?.status === 'REJECTED') {
        response = await resubmitKyc(
          user.id,
          request,
          frontImage || undefined,
          backImage || undefined,
          selfieImage || undefined
        );
      } else {
        response = await submitKyc(
          user.id,
          request,
          frontImage!,
          backImage || undefined,
          selfieImage || undefined
        );
      }

      if (response.status === 200 || response.status === 201) {
        toast.success(response.message || 'Gửi yêu cầu xác minh thành công');
        setKyc(response.data);
        setShowForm(false);
        resetForm();
      } else {
        toast.error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setDocumentNumber('');
    setFullName('');
    setDateOfBirth('');
    setAddress('');
    setFrontImage(null);
    setBackImage(null);
    setSelfieImage(null);
    setFrontPreview('');
    setBackPreview('');
    setSelfiePreview('');
  };

  const renderStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'REJECTED':
        return <XCircle className="w-16 h-16 text-red-500" />;
      case 'PENDING':
      case 'UNDER_REVIEW':
        return <Clock className="w-16 h-16 text-yellow-500" />;
      default:
        return <AlertCircle className="w-16 h-16 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#214d8c]" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-8 h-8 text-[#214d8c]" />
              <h1 className="text-2xl font-bold text-gray-900">Xác minh danh tính (KYC)</h1>
            </div>

            {/* Current KYC Status */}
            {kyc && !showForm && (
              <div className="text-center py-8">
                {renderStatusIcon(kyc.status)}
                <h2 className="text-xl font-semibold mt-4 mb-2">
                  {getKycStatusLabel(kyc.status)}
                </h2>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getKycStatusColor(kyc.status)}`}>
                  {getKycStatusLabel(kyc.status)}
                </span>

                {kyc.status === 'APPROVED' && (
                  <div className="mt-6 p-4 bg-green-50 rounded-lg">
                    <p className="text-green-700">
                      ✅ Tài khoản của bạn đã được xác minh thành công!
                    </p>
                    <p className="text-sm text-green-600 mt-2">
                      Hết hạn: {kyc.expiresAt ? new Date(kyc.expiresAt).toLocaleDateString('vi-VN') : 'N/A'}
                    </p>
                  </div>
                )}

                {kyc.status === 'PENDING' && (
                  <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                    <p className="text-yellow-700">
                      ⏳ Yêu cầu xác minh của bạn đang được xem xét.
                    </p>
                    <p className="text-sm text-yellow-600 mt-2">
                      Thời gian xử lý: 1-3 ngày làm việc
                    </p>
                  </div>
                )}

                {kyc.status === 'REJECTED' && (
                  <div className="mt-6 p-4 bg-red-50 rounded-lg">
                    <p className="text-red-700">
                      ❌ Yêu cầu xác minh bị từ chối
                    </p>
                    {kyc.rejectionReason && (
                      <p className="text-sm text-red-600 mt-2">
                        Lý do: {kyc.rejectionReason}
                      </p>
                    )}
                    <Button
                      onClick={() => {
                        setShowForm(true);
                        setDocumentType(kyc.documentType);
                        setDocumentNumber(kyc.documentNumber);
                        setFullName(kyc.fullName);
                        setDateOfBirth(kyc.dateOfBirth || '');
                        setAddress(kyc.address || '');
                      }}
                      className="mt-4 bg-[#214d8c]"
                    >
                      Gửi lại yêu cầu
                    </Button>
                  </div>
                )}

                {/* KYC Details */}
                {kyc.status !== 'NOT_SUBMITTED' && (
                  <div className="mt-8 text-left border-t pt-6">
                    <h3 className="font-semibold mb-4">Thông tin đã gửi:</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Loại giấy tờ:</span>
                        <p className="font-medium">{getDocumentTypeLabel(kyc.documentType)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Số giấy tờ:</span>
                        <p className="font-medium">{kyc.documentNumber}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Họ tên:</span>
                        <p className="font-medium">{kyc.fullName}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Ngày gửi:</span>
                        <p className="font-medium">
                          {kyc.submittedAt ? new Date(kyc.submittedAt).toLocaleDateString('vi-VN') : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* KYC Form */}
            {(showForm || !kyc) && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <h3 className="font-semibold text-blue-800 mb-2">📋 Hướng dẫn xác minh</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Chuẩn bị CCCD/CMND/Hộ chiếu còn hiệu lực</li>
                    <li>• Chụp ảnh rõ nét, đủ sáng, không bị mờ</li>
                    <li>• Thông tin trên ảnh phải khớp với thông tin bạn nhập</li>
                    <li>• Ảnh selfie cầm giấy tờ (tùy chọn) giúp xác minh nhanh hơn</li>
                  </ul>
                </div>

                {/* Document Type */}
                <div className="space-y-2">
                  <Label>Loại giấy tờ *</Label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                    className="w-full h-10 rounded-md border px-3 text-sm bg-white"
                    disabled={submitting}
                  >
                    {DOCUMENT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Document Number */}
                <div className="space-y-2">
                  <Label>Số giấy tờ *</Label>
                  <Input
                    value={documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value)}
                    placeholder="Nhập số CCCD/CMND/Hộ chiếu"
                    disabled={submitting}
                  />
                </div>

                {/* Full Name */}
                <div className="space-y-2">
                  <Label>Họ và tên (theo giấy tờ) *</Label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nhập họ và tên đầy đủ"
                    disabled={submitting}
                  />
                </div>

                {/* Date of Birth */}
                <div className="space-y-2">
                  <Label>Ngày sinh</Label>
                  <Input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    disabled={submitting}
                  />
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label>Địa chỉ thường trú</Label>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Nhập địa chỉ theo giấy tờ"
                    disabled={submitting}
                  />
                </div>

                {/* Image Uploads */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Front Image */}
                  <div className="space-y-2">
                    <Label>Ảnh mặt trước *</Label>
                    <div className="border-2 border-dashed rounded-lg p-4 text-center">
                      {frontPreview ? (
                        <img src={frontPreview} alt="Front" className="w-full h-32 object-cover rounded" />
                      ) : (
                        <div className="h-32 flex flex-col items-center justify-center text-gray-400">
                          <Upload className="w-8 h-8 mb-2" />
                          <span className="text-sm">Tải ảnh lên</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, setFrontImage, setFrontPreview)}
                        className="mt-2 w-full text-sm"
                        disabled={submitting}
                      />
                    </div>
                  </div>

                  {/* Back Image */}
                  <div className="space-y-2">
                    <Label>Ảnh mặt sau</Label>
                    <div className="border-2 border-dashed rounded-lg p-4 text-center">
                      {backPreview ? (
                        <img src={backPreview} alt="Back" className="w-full h-32 object-cover rounded" />
                      ) : (
                        <div className="h-32 flex flex-col items-center justify-center text-gray-400">
                          <Upload className="w-8 h-8 mb-2" />
                          <span className="text-sm">Tải ảnh lên</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, setBackImage, setBackPreview)}
                        className="mt-2 w-full text-sm"
                        disabled={submitting}
                      />
                    </div>
                  </div>

                  {/* Selfie Image */}
                  <div className="space-y-2">
                    <Label>Ảnh selfie cầm giấy tờ</Label>
                    <div className="border-2 border-dashed rounded-lg p-4 text-center">
                      {selfiePreview ? (
                        <img src={selfiePreview} alt="Selfie" className="w-full h-32 object-cover rounded" />
                      ) : (
                        <div className="h-32 flex flex-col items-center justify-center text-gray-400">
                          <Upload className="w-8 h-8 mb-2" />
                          <span className="text-sm">Tải ảnh lên</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, setSelfieImage, setSelfiePreview)}
                        className="mt-2 w-full text-sm"
                        disabled={submitting}
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  {kyc && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForm(false)}
                      disabled={submitting}
                      className="flex-1"
                    >
                      Hủy
                    </Button>
                  )}
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-[#214d8c] hover:bg-[#1a3d6e]"
                  >
                    {submitting ? 'Đang gửi...' : kyc?.status === 'REJECTED' ? 'Gửi lại' : 'Gửi xác minh'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default KycPage;
