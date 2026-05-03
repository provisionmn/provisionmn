import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { FileText, Shield, CheckCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

interface QuoteRequestProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onBack: () => void;
}

export function QuoteRequest({ initialData, onSubmit, onBack }: QuoteRequestProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    projectType: initialData?.projectType || "",
    description: initialData?.description || "",
    budget: "",
    timeline: initialData?.timeline || "",
    estimatedPrice: initialData?.estimatedPrice || 0,
    ...initialData
  });

  const [captcha, setCaptcha] = useState({
    question: "",
    answer: "",
    userAnswer: "",
    isValid: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Generate simple math captcha
  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operators = ['+', '-', '*'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    
    let answer;
    let question;
    
    switch (operator) {
      case '+':
        answer = num1 + num2;
        question = `${num1} + ${num2} = ?`;
        break;
      case '-':
        answer = Math.max(num1, num2) - Math.min(num1, num2);
        question = `${Math.max(num1, num2)} - ${Math.min(num1, num2)} = ?`;
        break;
      case '*':
        answer = num1 * num2;
        question = `${num1} × ${num2} = ?`;
        break;
      default:
        answer = num1 + num2;
        question = `${num1} + ${num2} = ?`;
    }
    
    setCaptcha({
      question,
      answer: answer.toString(),
      userAnswer: "",
      isValid: false
    });
  };

  useState(() => {
    generateCaptcha();
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCaptchaChange = (value: string) => {
    setCaptcha(prev => ({
      ...prev,
      userAnswer: value,
      isValid: value === prev.answer
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!captcha.isValid) {
      alert("CAPTCHA хариултыг зөв оруулна уу!");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const requestData = {
      ...formData,
      requestId: `REQ-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    
    onSubmit(requestData);
    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  if (isSubmitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-foreground mb-2">
            Хүсэлт амжилттай илгээгдлээ!
          </h3>
          <p className="text-muted-foreground mb-6">
            Таны хүсэлтийг хүлээн авлаа. Бид 24 цагийн дотор таны имэйл хаягруу дэлгэрэнгүй үнийн санал илгээх болно.
          </p>
          <div className="bg-muted p-4 rounded-lg mb-6">
            <p className="text-sm font-medium text-foreground">
              Хүсэлтийн дугаар: REQ-{Date.now()}
            </p>
          </div>
          <div className="flex gap-4 justify-center">
            <Button onClick={onBack}>
              Үндсэн хуудас руу буцах
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Шинэ хүсэлт үүсгэх
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Үнийн санал хүсэх
          </CardTitle>
          <p className="text-muted-foreground">
            Дэлгэрэнгүй мэдээлэл оруулснаар бид танд тохирсон үнийн санал бэлдэж өгнө
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Овог нэр *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Имэйл хаяг *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Утасны дугаар *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="company">Компанийн нэр</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                />
              </div>
            </div>

            {/* Project Information */}
            <div>
              <Label htmlFor="projectType">Төслийн төрөл *</Label>
              <Select 
                value={formData.projectType} 
                onValueChange={(value) => handleInputChange('projectType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Төслийн төрлийг сонгоно уу" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Вэб сайт">Вэб сайт хөгжүүлэлт</SelectItem>
                  <SelectItem value="Мобайл апп">Мобайл апп хөгжүүлэлт</SelectItem>
                  <SelectItem value="Odoo ERP">Odoo ERP систем</SelectItem>
                  <SelectItem value="Захиалгат шийдэл">Захиалгат шийдэл</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Төслийн дэлгэрэнгүй тайлбар *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Төслийн талаар дэлгэрэнгүй бичнэ үү..."
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="budget">Төсөв (₮)</Label>
                <Select 
                  value={formData.budget} 
                  onValueChange={(value) => handleInputChange('budget', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Төсвийн хэмжээг сонгоно уу" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="500000-1000000">₮500,000 - ₮1,000,000</SelectItem>
                    <SelectItem value="1000000-2000000">₮1,000,000 - ₮2,000,000</SelectItem>
                    <SelectItem value="2000000-5000000">₮2,000,000 - ₮5,000,000</SelectItem>
                    <SelectItem value="5000000+">₮5,000,000+</SelectItem>
                    <SelectItem value="discuss">Ярилцах</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="timeline">Хугацаа</Label>
                <Select 
                  value={formData.timeline} 
                  onValueChange={(value) => handleInputChange('timeline', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Хугацааг сонгоно уу" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">Я��ралтай (1-2 долоо хоног)</SelectItem>
                    <SelectItem value="normal">Стандарт (2-4 долоо хоног)</SelectItem>
                    <SelectItem value="flexible">Уян хатан (4-8 долоо хоног)</SelectItem>
                    <SelectItem value="long">Урт хугацаа (8+ долоо хоног)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price Estimate Display */}
            {formData.estimatedPrice > 0 && (
              <Alert>
                <AlertDescription>
                  <strong>Урьдчилсан үнийн тооцоо:</strong> ₮{formData.estimatedPrice?.toLocaleString()} 
                  ({formData.estimatedHours} хүн-цаг)
                </AlertDescription>
              </Alert>
            )}

            {/* CAPTCHA */}
            <div className="border rounded-lg p-4 bg-muted/50">
              <Label className="flex items-center gap-2 mb-3">
                <Shield className="h-4 w-4 text-primary" />
                Аюулгүй байдлын шалгалт (CAPTCHA)
              </Label>
              <div className="flex items-center gap-4">
                <div className="bg-white dark:bg-background border rounded px-3 py-2 font-mono text-lg min-w-[120px] text-center">
                  {captcha.question}
                </div>
                <Input
                  type="number"
                  placeholder="Хариулт"
                  value={captcha.userAnswer}
                  onChange={(e) => handleCaptchaChange(e.target.value)}
                  className="w-24"
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateCaptcha}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                {captcha.isValid && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={onBack} className="flex-1">
                Буцах
              </Button>
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={isSubmitting || !captcha.isValid}
              >
                {isSubmitting ? "Илгээж байна..." : "Хүсэлт илгээх"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}