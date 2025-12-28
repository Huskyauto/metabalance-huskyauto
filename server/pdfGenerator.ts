import PDFDocument from "pdfkit";
import { Readable } from "stream";

interface ProgressData {
  currentWeight: number;
  targetWeight: number;
  weightLogs: Array<{
    weight: number;
    loggedAt: Date;
  }>;
  nutritionStats: {
    avgCalories: number;
    avgProtein: number;
    avgCarbs: number;
    avgFats: number;
  };
  streakData: {
    currentStreak: number;
    longestStreak: number;
  };
  dailyWins: {
    totalDays: number;
    avgStars: number;
    perfectDays: number;
  };
  userName: string;
}

export async function generateProgressPDF(data: ProgressData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Header with branding
    doc
      .fontSize(24)
      .fillColor("#14b8a6")
      .text("MetaBalance", { align: "center" });
    
    doc
      .fontSize(12)
      .fillColor("#666")
      .text("Your Metabolic Health Journey", { align: "center" });
    
    doc.moveDown(2);

    // User info
    doc
      .fontSize(16)
      .fillColor("#000")
      .text(`Progress Report for ${data.userName}`, { underline: true });
    
    doc.moveDown();

    // Weight Progress Section
    doc
      .fontSize(14)
      .fillColor("#14b8a6")
      .text("Weight Progress", { underline: true });
    
    doc.moveDown(0.5);
    
    doc
      .fontSize(12)
      .fillColor("#000")
      .text(`Current Weight: ${data.currentWeight} lbs`);
    
    doc.text(`Target Weight: ${data.targetWeight} lbs`);
    
    const weightLoss = data.currentWeight - data.targetWeight;
    const progress = data.weightLogs.length > 0 
      ? data.currentWeight - data.weightLogs[data.weightLogs.length - 1].weight 
      : 0;
    
    doc.text(`Weight to Go: ${weightLoss.toFixed(1)} lbs`);
    doc.text(`Total Progress: ${Math.abs(progress).toFixed(1)} lbs ${progress < 0 ? 'lost' : 'gained'}`);
    
    doc.moveDown(1.5);

    // Streak & Daily Wins Section
    doc
      .fontSize(14)
      .fillColor("#14b8a6")
      .text("Engagement & Consistency", { underline: true });
    
    doc.moveDown(0.5);
    
    doc
      .fontSize(12)
      .fillColor("#000")
      .text(`Current Streak: ${data.streakData.currentStreak} days`);
    
    doc.text(`Longest Streak: ${data.streakData.longestStreak} days`);
    doc.text(`Total Days Tracked: ${data.dailyWins.totalDays}`);
    doc.text(`Average Daily Stars: ${data.dailyWins.avgStars.toFixed(1)} / 5.0`);
    doc.text(`Perfect Days (5 stars): ${data.dailyWins.perfectDays}`);
    
    doc.moveDown(1.5);

    // Nutrition Stats Section
    doc
      .fontSize(14)
      .fillColor("#14b8a6")
      .text("Nutrition Summary (7-Day Average)", { underline: true });
    
    doc.moveDown(0.5);
    
    doc
      .fontSize(12)
      .fillColor("#000")
      .text(`Average Calories: ${Math.round(data.nutritionStats.avgCalories)} cal/day`);
    
    doc.text(`Average Protein: ${Math.round(data.nutritionStats.avgProtein)}g/day`);
    doc.text(`Average Carbs: ${Math.round(data.nutritionStats.avgCarbs)}g/day`);
    doc.text(`Average Fats: ${Math.round(data.nutritionStats.avgFats)}g/day`);
    
    doc.moveDown(1.5);

    // Weight Log History (last 10 entries)
    if (data.weightLogs.length > 0) {
      doc
        .fontSize(14)
        .fillColor("#14b8a6")
        .text("Recent Weight Entries", { underline: true });
      
      doc.moveDown(0.5);
      
      const recentLogs = data.weightLogs.slice(-10).reverse();
      
      doc.fontSize(10);
      recentLogs.forEach((log) => {
        const date = new Date(log.loggedAt).toLocaleDateString();
        doc.fillColor("#000").text(`${date}: ${log.weight} lbs`);
      });
      
      doc.moveDown(1.5);
    }

    // Footer
    doc
      .fontSize(10)
      .fillColor("#666")
      .text(
        `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
        { align: "center" }
      );
    
    doc.moveDown(0.5);
    
    doc
      .fontSize(8)
      .fillColor("#999")
      .text(
        "This report is for informational purposes only and does not constitute medical advice. Consult with a healthcare professional before making significant changes to your diet or exercise routine.",
        { align: "center", width: 500 }
      );

    doc.end();
  });
}
