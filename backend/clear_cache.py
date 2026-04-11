from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import os
from dotenv import load_dotenv

async def clear_failed_detections():
    # Connect based on .env
    load_dotenv('backend/.env')
    mongo_url = os.getenv("MONGO_URL", "mongodb://localhost:27017")
    db_name = os.getenv("DB_NAME", "farmex")
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    coll = db["disease_detections"]
    
    # Define keywords that indicate a failed or placeholder detection
    fail_keywords = ["unavailable", "unsupported", "warming up", "unclear"]
    
    print(f"Connecting to MongoDB at {mongo_url}...")
    
    deleted_count = 0
    # Process each doc and check the detection_result contents
    async for doc in coll.find():
        res = doc.get("detection_result", {})
        d_name = str(res.get("disease_name", "")).lower()
        if any(kw in d_name for kw in fail_keywords):
            await coll.delete_one({"_id": doc["_id"]})
            deleted_count += 1
            
    print(f"Finished! Deleted {deleted_count} stale failure records from 'disease_detections'.")
    client.close()

if __name__ == "__main__":
    asyncio.run(clear_failed_detections())
