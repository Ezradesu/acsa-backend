import { Injectable, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class SupabaseService {
    private readonly logger = new Logger(SupabaseService.name);
    private client: SupabaseClient;

    /** MIME types yang akan dikonversi ke WebP */
    private static readonly CONVERTIBLE_IMAGE_TYPES = new Set([
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/bmp',
        'image/tiff',
        'image/avif',
    ]);

    constructor() {
        this.client = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_KEY!,
        );
    }

    /**
     * Mengkonversi buffer gambar ke format WebP menggunakan sharp.
     * File yang sudah WebP atau bukan gambar dikembalikan apa adanya.
     */
    private async convertToWebP(
        buffer: Buffer,
        mimetype: string,
    ): Promise<{ buffer: Buffer; mimetype: string }> {
        if (!SupabaseService.CONVERTIBLE_IMAGE_TYPES.has(mimetype)) {
            return { buffer, mimetype };
        }

        const convertedBuffer = await sharp(buffer)
            .resize({ width: 1920, withoutEnlargement: true }) // cap max width, jaga aspect ratio
            .webp({ quality: 82 })
            .toBuffer();

        this.logger.debug(
            `Converted image from ${mimetype} to image/webp ` +
            `(${buffer.length} → ${convertedBuffer.length} bytes)`,
        );

        return { buffer: convertedBuffer, mimetype: 'image/webp' };
    }

    /**
     * Mengganti ekstensi path file dengan .webp.
     * Contoh: "products/abc/1234-photo.jpg" → "products/abc/1234-photo.webp"
     */
    private replaceExtensionToWebP(filePath: string): string {
        const ext = path.extname(filePath);
        return ext ? filePath.slice(0, -ext.length) + '.webp' : filePath + '.webp';
    }

    /**
     * Upload file ke Supabase Storage.
     * Gambar secara otomatis dikonversi ke WebP sebelum diupload.
     */
    async uploadFile(
        bucket: string,
        filePath: string,
        file: Express.Multer.File,
    ): Promise<string> {
        const { buffer, mimetype } = await this.convertToWebP(
            file.buffer,
            file.mimetype,
        );

        const finalPath =
            mimetype === 'image/webp'
                ? this.replaceExtensionToWebP(filePath)
                : filePath;

        const { error } = await this.client.storage
            .from(bucket)
            .upload(finalPath, buffer, {
                contentType: mimetype,
                upsert: true,
            });

        if (error) throw new Error(`Supabase upload error: ${error.message}`);

        const { data } = this.client.storage.from(bucket).getPublicUrl(finalPath);
        return data.publicUrl;
    }

    async deleteFile(bucket: string, filePath: string): Promise<void> {
        const { error } = await this.client.storage.from(bucket).remove([filePath]);
        if (error) throw new Error(`Supabase delete error: ${error.message}`);
    }
}