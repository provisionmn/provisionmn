import { ArrowLeft, CheckCircle, Code, Smartphone, Settings, Users, Clock, Star } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

interface ServicesDetailProps {
  onBack: () => void;
}

export function ServicesDetail({ onBack }: ServicesDetailProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-background">
      {/* Header */}
      <div className="bg-white dark:bg-background border-b border-border sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Буцах
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-4">Манай үйлчилгээнүүд</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Бид танай бизнесийн цифровых шийдлийг бүрэн хангахад туслах дараах үйлчилгээнүүдийг санал болгож байна
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Main Services */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {/* Web Development */}
          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Code className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Веб хөгжүүлэлт</CardTitle>
              <CardDescription>
                Орчин үеийн, хурдан ба найдвартай вебсайтууд
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm">Responsive дизайн</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm">SEO оновчилгоо</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm">CMS систем</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm">E-commerce платформ</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-3">Технологиуд:</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">React</Badge>
                  <Badge variant="secondary">Next.js</Badge>
                  <Badge variant="secondary">Vue.js</Badge>
                  <Badge variant="secondary">Laravel</Badge>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Хугацаа:</span>
                  <span className="text-sm text-muted-foreground">2-8 долоо хоног</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Үнэ:</span>
                  <span className="text-lg font-bold text-primary">₮500,000+</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mobile Development */}
          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Мобайл хөгжүүлэлт</CardTitle>
              <CardDescription>
                iOS болон Android платформын аппликешнүүд
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm">Native хөгжүүлэлт</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm">Cross-platform</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm">UI/UX дизайн</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm">App Store зөвшөөрөл</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-3">Технологиуд:</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">React Native</Badge>
                  <Badge variant="secondary">Flutter</Badge>
                  <Badge variant="secondary">Swift</Badge>
                  <Badge variant="secondary">Kotlin</Badge>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Хугацаа:</span>
                  <span className="text-sm text-muted-foreground">4-12 долоо хоног</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Үнэ:</span>
                  <span className="text-lg font-bold text-primary">₮800,000+</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ERP Development */}
          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Odoo ERP систем</CardTitle>
              <CardDescription>
                Бизнес удирдлагын цогц систем
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm">Санхүү удирдлага</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm">Бараа материалын удирдлага</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm">CRM систем</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm">Хүний нөөцийн удирдлага</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-3">Модулууд:</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Борлуулалт</Badge>
                  <Badge variant="secondary">Худалдан авалт</Badge>
                  <Badge variant="secondary">Агуулах</Badge>
                  <Badge variant="secondary">Хүний нөөц</Badge>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Хугацаа:</span>
                  <span className="text-sm text-muted-foreground">6-16 долоо хоног</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Үнэ:</span>
                  <span className="text-lg font-bold text-primary">₮1,200,000+</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Process Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Бидний ажлын үйл явц</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Таны төслийг амжилттай хэрэгжүүлэх 6 алхмын үйл явц
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Хэрэгцээний судалгаа",
                description: "Таны бизнесийн хэрэгцээг сайтар судалж, шаардлагыг тодорхойлно",
                icon: Users
              },
              {
                step: "02", 
                title: "Төлөвлөлт",
                description: "Техникийн шийдэл, дизайн болон хуваарийг боловсруулна",
                icon: Clock
              },
              {
                step: "03",
                title: "Дизайн",
                description: "UI/UX дизайныг таны брэндэд тохируулан бэлтгэнэ",
                icon: Star
              },
              {
                step: "04",
                title: "Хөгжүүлэлт",
                description: "Орчин үеийн технологи ашиглан системийг хөгжүүлнэ",
                icon: Code
              },
              {
                step: "05",
                title: "Туршилт",
                description: "Системийн бүх функцийг нарийвчлан шалгаж туршина",
                icon: CheckCircle
              },
              {
                step: "06",
                title: "Ашиглалтад оруулах",
                description: "Системийг амжилттай ашиглалтад оруулж дэмжлэг үзүүлнэ",
                icon: Settings
              }
            ].map((process, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <process.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="text-2xl font-bold text-primary mb-2">{process.step}</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{process.title}</h3>
                <p className="text-sm text-muted-foreground">{process.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="bg-gray-50 dark:bg-muted/50 rounded-2xl p-8 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Яагаад биднийг сонгох ёстой?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              5 жилийн туршлага, 100+ амжилттай төсөл, 24/7 дэмжлэгтэй
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">5+</div>
              <div className="text-sm text-muted-foreground">Жилийн туршлага</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">100+</div>
              <div className="text-sm text-muted-foreground">Амжилттай төсөл</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">50+</div>
              <div className="text-sm text-muted-foreground">Итгэлцэн ажилладаг үйлчлүүлэгч</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <div className="text-sm text-muted-foreground">Дэмжлэгийн үйлчилгээ</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-primary/5 rounded-2xl p-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Танай хөгжүүлэх гэж буй төслийн талаар ярилцъя
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Бид таны бизнесийн хэрэгцээнд тохирсон шийдлийг санал болгож, төслийн талаар дэлгэрэнгүй зөвлөгөө өгөхөд бэлэн байна.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="min-w-[200px]">
              Үнэгүй зөвлөгөө авах
            </Button>
            <Button variant="outline" size="lg" className="min-w-[200px]">
              Портфолио үзэх
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}