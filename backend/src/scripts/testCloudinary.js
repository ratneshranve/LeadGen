const cloudinaryService = require("../services/cloudinary.service");
const uploadService = require("../modules/uploads/upload.service");
const config = require("../../config/env");

async function testCloudinaryIntegration() {
  console.log("\n==========================================");
  console.log(" 🧪 TESTING CLOUDINARY INTEGRATION MODULE");
  console.log("==========================================\n");

  console.log("1. Checking Environment-based Configuration...");
  console.log(`   - Cloud Name Configured: ${config.cloudinary.cloudName ? "YES (" + config.cloudinary.cloudName + ")" : "NO"}`);
  console.log(`   - API Key Configured: ${config.cloudinary.apiKey ? "YES (" + config.cloudinary.apiKey.substring(0, 4) + "****)" : "NO"}`);
  console.log(`   - API Secret Configured: ${config.cloudinary.apiSecret ? "YES (****)" : "NO"}`);

  console.log("\n2. Testing Validation Methods...");
  // Valid Image Test
  const mockImage = {
    mimetype: "image/png",
    size: 2 * 1024 * 1024, // 2MB
    originalname: "test-profile.png",
  };
  try {
    const validImg = cloudinaryService.validateImage(mockImage);
    console.log(`   - Image Validation (Valid 2MB PNG): PASS (${validImg})`);
  } catch (err) {
    console.log(`   - Image Validation (Valid 2MB PNG): FAIL (${err.message})`);
  }

  // Invalid Image Type Test
  const mockExecutable = {
    mimetype: "application/x-msdownload",
    size: 1 * 1024 * 1024,
    originalname: "malicious.exe",
  };
  try {
    cloudinaryService.validateImage(mockExecutable);
    console.log("   - Image Validation (Invalid MIME .exe): FAIL (Should have thrown error)");
  } catch (err) {
    console.log(`   - Image Validation (Invalid MIME .exe): PASS (Caught expected: "${err.message}")`);
  }

  // Oversized Image Test
  const mockLargeImg = {
    mimetype: "image/jpeg",
    size: 8 * 1024 * 1024, // 8MB
    originalname: "large.jpg",
  };
  try {
    cloudinaryService.validateImage(mockLargeImg);
    console.log("   - Image Validation (Oversized 8MB JPG): FAIL (Should have thrown error)");
  } catch (err) {
    console.log(`   - Image Validation (Oversized 8MB JPG): PASS (Caught expected: "${err.message}")`);
  }

  // Valid Document Test
  const mockPdf = {
    mimetype: "application/pdf",
    size: 4 * 1024 * 1024, // 4MB
    originalname: "contract.pdf",
  };
  try {
    const validDoc = cloudinaryService.validateDocument(mockPdf);
    console.log(`   - Document Validation (Valid 4MB PDF): PASS (${validDoc})`);
  } catch (err) {
    console.log(`   - Document Validation (Valid 4MB PDF): FAIL (${err.message})`);
  }

  console.log("\n3. Testing Service Isolation & Error Handling (Upload without credentials / stream fail handling)...");
  const dummyBuffer = Buffer.from("fake image binary buffer content");
  
  if (config.cloudinary.cloudName === "your_cloudinary_cloud_name" || !config.cloudinary.apiKey) {
    console.log("   - Cloudinary dummy credentials detected in .env.");
    console.log("   - Attempting Cloudinary upload to test graceful failure handling...");
    try {
      await cloudinaryService.uploadFile(dummyBuffer, "appzeto/test", "image");
      console.log("   - Upload Result: FAIL (Expected API rejection with dummy keys)");
    } catch (err) {
      console.log(`   - Upload Failure Handling: PASS (Gracefully caught API error: "${err.message}")`);
    }
  } else {
    console.log("   - Valid credentials found, testing upload execution...");
    try {
      const uploadRes = await cloudinaryService.uploadFile(dummyBuffer, "appzeto/test", "image");
      console.log(`   - Upload Success: PASS (URL: ${uploadRes.url}, PublicID: ${uploadRes.publicId})`);
      
      console.log("   - Testing Asset Replacement (Delete old asset & upload new)...");
      const replaceRes = await cloudinaryService.replaceFile(uploadRes.publicId, dummyBuffer, "appzeto/test", "image");
      console.log(`   - Replacement Success: PASS (New PublicID: ${replaceRes.publicId})`);
      
      console.log("   - Testing Asset Deletion...");
      await cloudinaryService.deleteFile(replaceRes.publicId, "image");
      console.log("   - Deletion Success: PASS");
    } catch (err) {
      console.log(`   - Cloudinary API Error: ${err.message}`);
    }
  }

  console.log("\n==========================================");
  console.log(" 🎉 ALL CLOUDINARY INTEGRATION TESTS COMPLETED");
  console.log("==========================================\n");
}

testCloudinaryIntegration();
