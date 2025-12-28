import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BMRResult {
  bmr: number;
  tdee: number;
  deficitTarget: number;
}

export function BMRCalculator() {
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState('35');
  const [height, setHeight] = useState('70'); // inches
  const [weight, setWeight] = useState('200'); // lbs
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [result, setResult] = useState<BMRResult | null>(null);

  // Activity level multipliers
  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,      // Little or no exercise
    light: 1.375,        // Light exercise 1-3 days/week
    moderate: 1.55,      // Moderate exercise 3-5 days/week
    active: 1.725,       // Hard exercise 6-7 days/week
    veryactive: 1.9,     // Very hard exercise & physical job
  };

  const calculateBMR = () => {
    const ageNum = parseFloat(age);
    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);

    if (!ageNum || !heightNum || !weightNum) {
      alert('Please fill in all fields');
      return;
    }

    // Mifflin-St Jeor Equation
    let bmr: number;
    if (gender === 'male') {
      bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum + 5;
    } else {
      bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum - 161;
    }

    // Calculate TDEE
    const multiplier = activityMultipliers[activityLevel] || 1.55;
    const tdee = bmr * multiplier;

    // 750 cal/day deficit for ~1.5 lbs/week weight loss
    const deficitTarget = Math.round(tdee - 750);

    setResult({
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      deficitTarget,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>BMR & TDEE Calculator</CardTitle>
          <CardDescription>
            Calculate your Basal Metabolic Rate and Total Daily Energy Expenditure using the Mifflin-St Jeor equation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gender */}
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={gender} onValueChange={(value) => setGender(value as 'male' | 'female')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Age */}
            <div className="space-y-2">
              <Label>Age (years)</Label>
              <Input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="35"
              />
            </div>

            {/* Height */}
            <div className="space-y-2">
              <Label>Height (inches)</Label>
              <Input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="70"
              />
            </div>

            {/* Weight */}
            <div className="space-y-2">
              <Label>Weight (lbs)</Label>
              <Input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="200"
              />
            </div>

            {/* Activity Level */}
            <div className="space-y-2 md:col-span-2">
              <Label>Activity Level</Label>
              <Select value={activityLevel} onValueChange={setActivityLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                  <SelectItem value="light">Light (1-3 days/week)</SelectItem>
                  <SelectItem value="moderate">Moderate (3-5 days/week)</SelectItem>
                  <SelectItem value="active">Active (6-7 days/week)</SelectItem>
                  <SelectItem value="veryactive">Very Active (hard exercise & physical job)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Calculate Button */}
          <Button onClick={calculateBMR} className="w-full" size="lg">
            Calculate
          </Button>

          {/* Results */}
          {result && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div className="space-y-2 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Basal Metabolic Rate</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{result.bmr}</p>
                <p className="text-xs text-gray-500">calories/day at rest</p>
              </div>

              <div className="space-y-2 p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Daily Energy Expenditure</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{result.tdee}</p>
                <p className="text-xs text-gray-500">calories/day with activity</p>
              </div>

              <div className="space-y-2 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">750 Cal Deficit Target</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{result.deficitTarget}</p>
                <p className="text-xs text-gray-500">~1.5 lbs/week loss</p>
              </div>
            </div>
          )}

          {/* Information */}
          <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm">
            <p className="font-semibold">How it works:</p>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>• <strong>BMR:</strong> Calories your body burns at rest</li>
              <li>• <strong>TDEE:</strong> Total calories burned including activity</li>
              <li>• <strong>750 Cal Deficit:</strong> Eating 750 cal/day less than TDEE = ~1.5 lbs/week weight loss</li>
              <li>• Based on Mifflin-St Jeor equation (most accurate for average adults)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
