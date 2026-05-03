import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Textarea } from "./ui/textarea";
import { Calculator, Clock, Users, DollarSign } from "lucide-react";

interface PriceCalculatorProps {
  onSubmit: (data: any) => void;
}

export function PriceCalculator({ onSubmit }: PriceCalculatorProps) {
  const [projectType, setProjectType] = useState("");
  const [complexity, setComplexity] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  const [timeline, setTimeline] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [description, setDescription] = useState("");
  
  const hourlyRate = 88000; // төгрөг/цаг

  const projectTypes = [
    { value: "website", label: "Вэб сайт", baseHours: 40 },
    { value: "mobile", label: "Мобайл апп", baseHours: 80 },
    { value: "erp", label: "Odoo ERP", baseHours: 120 },
    { value: "custom", label: "Захиалгат шийдэл", baseHours: 60 }
  ];

  const complexityLevels = [
    { value: "simple", label: "Энгийн", multiplier: 1 },
    { value: "medium", label: "Дундаж", multiplier: 1.5 },
    { value: "complex", label: "Төвөгтэй", multiplier: 2.5 },
    { value: "enterprise", label: "Энтерпрайз", multiplier: 4 }
  ];

  const additionalFeatures = [
    { id: "responsive", label: "Responsive дизайн", hours: 10 },
    { id: "cms", label: "CMS систем", hours: 20 },
    { id: "ecommerce", label: "E-commerce", hours: 30 },
    { id: "api", label: "API интеграци", hours: 15 },
    { id: "auth", label: "Хэрэглэгчийн системр", hours: 20 },
    { id: "admin", label: "Админ панел", hours: 25 },
    { id: "multilang", label: "Олон хэлний дэмжлэг", hours: 15 },
    { id: "analytics", label: "Аналитик систем", hours: 10 }
  ];

  const calculatePrice = () => {
    const selectedProject = projectTypes.find(p => p.value === projectType);
    const selectedComplexity = complexityLevels.find(c => c.value === complexity);
    
    if (!selectedProject || !selectedComplexity) return 0;

    let totalHours = selectedProject.baseHours * selectedComplexity.multiplier;
    
    features.forEach(featureId => {
      const feature = additionalFeatures.find(f => f.id === featureId);
      if (feature) totalHours += feature.hours;
    });

    return Math.round(totalHours * hourlyRate);
  };

  const handleFeatureChange = (featureId: string, checked: boolean) => {
    if (checked) {
      setFeatures([...features, featureId]);
    } else {
      setFeatures(features.filter(id => id !== featureId));
    }
  };

  const handleSubmit = () => {
    const price = calculatePrice();
    const selectedProject = projectTypes.find(p => p.value === projectType);
    const selectedComplexity = complexityLevels.find(c => c.value === complexity);
    
    const data = {
      projectType: selectedProject?.label,
      complexity: selectedComplexity?.label,
      features: features.map(id => additionalFeatures.find(f => f.id === id)?.label).filter(Boolean),
      timeline,
      teamSize,
      description,
      estimatedPrice: price,
      estimatedHours: Math.round(price / hourlyRate),
      createdAt: new Date().toISOString()
    };
    
    onSubmit(data);
  };

  const totalPrice = calculatePrice();
  const totalHours = Math.round(totalPrice / hourlyRate);

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Төслийн үнийн тооцогч
          </CardTitle>
          <p className="text-muted-foreground">
            Таны төслийн талаар мэдээлэл оруулж, үнийн санал авна уу (₮{hourlyRate.toLocaleString()}/хүн-цаг)
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Project Type */}
          <div>
            <Label>Төслийн төрөл</Label>
            <Select value={projectType} onValueChange={setProjectType}>
              <SelectTrigger>
                <SelectValue placeholder="Төслийн төрлийг сонгоно уу" />
              </SelectTrigger>
              <SelectContent>
                {projectTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label} (суурь: {type.baseHours} цаг)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Complexity */}
          <div>
            <Label>Төвөгтэй байдал</Label>
            <Select value={complexity} onValueChange={setComplexity}>
              <SelectTrigger>
                <SelectValue placeholder="Төвөгтэй байдлыг сонгоно уу" />
              </SelectTrigger>
              <SelectContent>
                {complexityLevels.map(level => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label} (x{level.multiplier})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Additional Features */}
          <div>
            <Label className="text-base font-medium mb-4 block">Нэмэлт функцууд</Label>
            <div className="grid grid-cols-2 gap-4">
              {additionalFeatures.map(feature => (
                <div key={feature.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={feature.id}
                    checked={features.includes(feature.id)}
                    onCheckedChange={(checked) => handleFeatureChange(feature.id, checked as boolean)}
                  />
                  <Label htmlFor={feature.id} className="text-sm">
                    {feature.label} (+{feature.hours} цаг)
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div>
            <Label>Хүссэн хугацаа</Label>
            <Select value={timeline} onValueChange={setTimeline}>
              <SelectTrigger>
                <SelectValue placeholder="Хугацааг сонгоно уу" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="urgent">Яаралтай (1-2 долоо хоног)</SelectItem>
                <SelectItem value="normal">Стандарт (2-4 долоо хоног)</SelectItem>
                <SelectItem value="flexible">Уян хатан (4-8 долоо хоног)</SelectItem>
                <SelectItem value="long">Урт хугацаа (8+ долоо хоног)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Team Size */}
          <div>
            <Label>Багийн хэмжээ</Label>
            <Select value={teamSize} onValueChange={setTeamSize}>
              <SelectTrigger>
                <SelectValue placeholder="Багийн хэмжээг сонгоно уу" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 хүн</SelectItem>
                <SelectItem value="2-3">2-3 хүн</SelectItem>
                <SelectItem value="4-6">4-6 хүн</SelectItem>
                <SelectItem value="6+">6+ хүн</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div>
            <Label>Төслийн дэлгэрэнгүй тайлбар</Label>
            <Textarea
              placeholder="Төслийн талаар дэлгэрэнгүй бичнэ үү..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          {/* Price Display */}
          {projectType && complexity && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <div className="text-2xl font-bold text-primary">{totalHours}</div>
                      <div className="text-sm text-muted-foreground">Хүн-цаг</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <div>
                      <div className="text-2xl font-bold text-primary">₮{totalPrice.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Тооцоолсон үнэ</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <div className="text-2xl font-bold text-primary">{Math.ceil(totalHours / 40)}</div>
                      <div className="text-sm text-muted-foreground">Долоо хоног</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Button 
            onClick={handleSubmit} 
            className="w-full" 
            size="lg"
            disabled={!projectType || !complexity || !description.trim()}
          >
            Үнийн санал авах
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}