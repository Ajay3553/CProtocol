import fs from 'fs'
import {v2 as cloudinary} from 'cloudinary'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try{
        if(!localFilePath){
            console.log("Path not found in Local File");
            return null;
        }

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto'
        })
        fs.unlinkSync(localFilePath)
        return response;
    }
    catch(e){
        fs.unlinkSync(localFilePath)
        return null
    }
}

const extractPublicId = (url) => {
    const [, afterUpload] = url.split('upload/');
    if (!afterUpload) return null;

    const withoutVersion = afterUpload.replace(/^v\d+\//, '');

    const dotIndex = withoutVersion.lastIndexOf('.');
    return dotIndex !== -1 ? withoutVersion.slice(0, dotIndex) : withoutVersion;
}

// resource_type: 'image' (default) | 'video' | 'raw'
const deleteFromCloudinary = async (url, resource_type = 'image') => {
    try {
        if (!url) return null;

        const publicId = extractPublicId(url);
        if (!publicId) {
            console.log("Could not extract public_id from URL:", url);
            return null;
        }

        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type,
            invalidate: true
        });

        console.log(`Deleted from Cloudinary [${publicId}]:`, result);
        return result;
    } catch (e) {
        console.error("Error deleting from Cloudinary:", e)
        return null
    }
}

export { uploadOnCloudinary, deleteFromCloudinary }