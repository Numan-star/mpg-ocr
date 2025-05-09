import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

interface Job {
  _id: ObjectId;
  blNumber: string;
  jobName: string;
  podDate: string;
  deliveryDate: Date;
  podSignature: string;
  totalQty: number;
  received: number;
  damaged: number;
  short: number;
  over: number;
  refused: number;
  noOfPages: number;
  stampExists: string;
  finalStatus: string;
  reviewStatus: string;
  recognitionStatus: string;
  breakdownReason: string;
  reviewedBy: string;
  cargoDescription: string;
  createdAt: string;
  updatedAt?: string;
}

const DB_NAME = process.env.DB_NAME || "my-next-app";


export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const dataCollection = db.collection<Job>("mockData");

    const job = await dataCollection.findOne({ _id: new ObjectId(id) });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(job, { status: 200 });
  } catch (error) {
    console.log("Error fetching job by ID:", error);
    return NextResponse.json({ error: "Failed to fetch job." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
    }

    const updatedJobData = await req.json();

    const intFields = ["blNumber", "totalQty", "received", "damaged", "short", "over", "refused"];
    for (const field of intFields) {
      const value = updatedJobData[field];
      if (typeof value === "string" && /^\d+$/.test(value)) {
        updatedJobData[field] = parseInt(value, 10);
      }
    }

    const headers = req.headers;
    const changedBy = headers.get("x-user-name") || "Unknown User";

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const dataCollection = db.collection("mockData");
    const historyCollection = db.collection("jobHistory");

    const existingJob = await dataCollection.findOne({ _id: new ObjectId(id) });

    if (!existingJob) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const historyEntries = [];
    for (const [key, newValue] of Object.entries(updatedJobData)) {
      const oldValue = existingJob[key];
      if (oldValue != newValue) {
        historyEntries.push({
          jobId: new ObjectId(id),
          field: key,
          oldValue: oldValue,
          newValue: newValue,
          changedBy: changedBy,
          changedOn: new Date(),
        });
      }
    }

    if (historyEntries.length === 0) {
      return NextResponse.json({ message: "No changes detected." }, { status: 200 });
    }

    updatedJobData.updatedAt = new Date();

    const result = await dataCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: updatedJobData,
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "No changes made" }, { status: 400 });
    }

    if (historyEntries.length > 0) {
      await historyCollection.insertMany(historyEntries);
    }

    return NextResponse.json({ message: "Job updated successfully" }, { status: 200 });
  } catch (error) {
    console.log("Error updating job:", error);
    return NextResponse.json({ error: "Failed to update job." }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({ allowedMethods: ["GET", "PATCH"] });
}
