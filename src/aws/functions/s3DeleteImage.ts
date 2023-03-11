import {DeleteObjectCommand, DeleteObjectCommandInput, DeleteObjectCommandOutput} from "@aws-sdk/client-s3"
import { s3Client } from "../lib/s3Client"

const s3DeleteImage = async(name: string): Promise<boolean | undefined> => {
    try{
        const params: DeleteObjectCommandInput = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: name 
        }
        const data: DeleteObjectCommandOutput = await s3Client.send(new DeleteObjectCommand(params))
        return data.DeleteMarker !== undefined ? true : false
    }catch(e){
        console.log(e)
    }
}

export default s3DeleteImage