import { getARLocationController } from "./src/modules/ar/controllers/ar.controller";
import { Request, Response } from "express";

// Mock request and response creators
const makeMockReq = (query: Record<string, string>): Partial<Request> => ({
    query,
    protocol: "http",
    get: (header: string) => "localhost:8080",
    originalUrl: "/api/v1/ar/location"
});

const makeMockRes = (): Partial<Response> & {
    statusCode: number;
    jsonPayload: any;
} => {
    const res: any = {
        statusCode: 200,
        jsonPayload: null,
    };
    res.status = function (code: number) {
        this.statusCode = code;
        return this;
    };
    res.json = function (payload: any) {
        this.jsonPayload = payload;
        return this;
    };
    return res;
};

async function testARPreview() {
    console.log("=== Testing AR Preview Backend System ===");
    
    // Test Case 1: Valid Landmark (Taj Mahal)
    {
        const req = makeMockReq({ name: "Taj Mahal" }) as Request;
        const res = makeMockRes() as any;
        await getARLocationController(req, res);
        console.log(`\nTest Case 1 (Taj Mahal): Status = ${res.statusCode}`);
        console.log(`Response payload:`, JSON.stringify(res.jsonPayload, null, 2));
        if (res.statusCode === 200 && res.jsonPayload.data.name === "Taj Mahal") {
            console.log("✅ Taj Mahal test passed!");
        } else {
            console.error("❌ Taj Mahal test failed!");
        }
    }

    // Test Case 2: Valid Landmark with different casing/spacing (eiffel_tower)
    {
        const req = makeMockReq({ name: "eiffel_tower" }) as Request;
        const res = makeMockRes() as any;
        await getARLocationController(req, res);
        console.log(`\nTest Case 2 (eiffel_tower): Status = ${res.statusCode}`);
        console.log(`Response payload:`, JSON.stringify(res.jsonPayload, null, 2));
        if (res.statusCode === 200 && res.jsonPayload.data.name === "Eiffel Tower") {
            console.log("✅ Eiffel Tower normalization test passed!");
        } else {
            console.error("❌ Eiffel Tower normalization test failed!");
        }
    }

    // Test Case 3: Missing parameter name
    {
        const req = makeMockReq({}) as Request;
        const res = makeMockRes() as any;
        await getARLocationController(req, res);
        console.log(`\nTest Case 3 (Missing Param): Status = ${res.statusCode}`);
        console.log(`Response payload:`, JSON.stringify(res.jsonPayload, null, 2));
        if (res.statusCode === 400) {
            console.log("✅ Missing parameter error handling passed!");
        } else {
            console.error("❌ Missing parameter error handling failed!");
        }
    }

    // Test Case 4: Non-existent landmark
    {
        const req = makeMockReq({ name: "UnknownLandmark" }) as Request;
        const res = makeMockRes() as any;
        await getARLocationController(req, res);
        console.log(`\nTest Case 4 (Unknown Landmark): Status = ${res.statusCode}`);
        console.log(`Response payload:`, JSON.stringify(res.jsonPayload, null, 2));
        if (res.statusCode === 404) {
            console.log("✅ Unknown landmark 404 handling passed!");
        } else {
            console.error("❌ Unknown landmark 404 handling failed!");
        }
    }
}

testARPreview().catch(console.error);
