import { Injectable, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class SupabaseService {
    private readonly logger = new Logger(SupabaseService.name);
    private client: SupabaseClient;

    constructor() {
        this.client = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_KEY!,
        );
    }

    /**
     * Upload file ke Supabase Storage.
     */
    async uploadFile(
        bucket: string,
        filePath: string,
        file: Express.Multer.File,
    ): Promise<string> {
        const { error } = await this.client.storage
            .from(bucket)
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: true,
            });

        if (error) throw new Error(`Supabase upload error: ${error.message}`);

        this.logger.debug(`Uploaded file ${filePath} (${file.size} bytes)`);

        const { data } = this.client.storage.from(bucket).getPublicUrl(filePath);
        return data.publicUrl;
    }

    async deleteFile(bucket: string, filePath: string): Promise<void> {
        const { error } = await this.client.storage.from(bucket).remove([filePath]);
        if (error) throw new Error(`Supabase delete error: ${error.message}`);
    }
}
