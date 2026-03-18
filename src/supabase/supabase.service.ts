import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class SupabaseService {
    private client: SupabaseClient;

    constructor() {
        this.client = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_KEY!,
        );
    }

    async uploadFile(
        bucket: string,
        path: string,
        file: Express.Multer.File,
    ): Promise<string> {
        const { error } = await this.client.storage
            .from(bucket)
            .upload(path, file.buffer, {
                contentType: file.mimetype,
                upsert: true,
            });

        if (error) throw new Error(error.message);

        const { data } = this.client.storage.from(bucket).getPublicUrl(path);
        return data.publicUrl;
    }

    async deleteFile(bucket: string, path: string): Promise<void> {
        const { error } = await this.client.storage.from(bucket).remove([path]);
        if (error) throw new Error(error.message);
    }
}