import { Injectable, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SupabaseService {
    private readonly logger = new Logger(SupabaseService.name);
    private client: SupabaseClient;

    constructor(config: ConfigService) {
        this.client = createClient(
            config.getOrThrow<string>('SUPABASE_URL'),
            config.getOrThrow<string>('SUPABASE_SERVICE_KEY'),
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
