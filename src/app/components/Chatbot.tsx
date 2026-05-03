import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { MessageCircle, Send, Bot, User, X, Minimize2, Maximize2 } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  options?: string[];
}

interface ChatbotProps {
  onQuoteRequest: (data: any) => void;
}

export function Chatbot({ onQuoteRequest }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Сайн байна уу! Би Provision.mn-ийн туслах робот байна. Таны төслийн талаар ярилцаж, үнийн санал бэлдэж өгөхөд туслана. Та ямар төрлийн төсөл хөгжүүлэх гэж байна?',
      sender: 'bot',
      timestamp: new Date(),
      options: ['Вэб сайт', 'Мобайл апп', 'Odoo ERP', 'Бусад']
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [chatState, setChatState] = useState<'greeting' | 'projectType' | 'details' | 'quote'>('greeting');
  const [projectData, setProjectData] = useState<any>({});
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (text: string, sender: 'user' | 'bot', options?: string[]) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date(),
      options
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleOptionClick = (option: string) => {
    addMessage(option, 'user');
    processUserInput(option);
  };

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;
    
    addMessage(currentMessage, 'user');
    processUserInput(currentMessage);
    setCurrentMessage('');
  };

  const processUserInput = (input: string) => {
    setTimeout(() => {
      switch (chatState) {
        case 'greeting':
          if (['Вэб сайт', 'Мобайл апп', 'Odoo ERP', 'Бусад'].includes(input)) {
            setProjectData(prev => ({ ...prev, projectType: input }));
            setChatState('details');
            addMessage(
              `${input} гэж сонгосон байна. Маш сайн! Одоо төслийн талаар дэлгэрэнгүй ярилцъя. Та ямар төрлийн функцууд хэрэгтэй вэ?`,
              'bot',
              input === 'Вэб сайт' ? 
                ['Энгийн танилцуулах сайт', 'E-commerce дэлгүүр', 'Блог/Мэдээний сайт', 'Захиалгат функц'] :
              input === 'Мобайл апп' ?
                ['iOS апп', 'Android апп', 'Cross-platform', 'Захиалгат функц'] :
              input === 'Odoo ERP' ?
                ['Борлуулалт', 'Нярав', 'Санхүү', 'Хүний нөөц', 'Бүгд'] :
                ['Дэлгэрэнгүй тайлбарлана уу']
            );
          }
          break;
          
        case 'details':
          setProjectData(prev => ({ ...prev, details: input }));
          addMessage(
            'Үнэтэй мэдээлэл өгсөнд баярлалаа! Төслийн хэмжээний талаар асуъя. Та ямар хэмжээний баг хэрэгтэй гэж бодож байна?',
            'bot',
            ['1 хүн (фрийлансер)', '2-3 хүн (жижиг баг)', '4-6 хүн (дундаж баг)', '6+ хүн (том баг)']
          );
          setChatState('quote');
          break;
          
        case 'quote':
          setProjectData(prev => ({ ...prev, teamSize: input }));
          
          // Calculate estimate based on collected data
          const estimateData = calculateEstimate({ ...projectData, teamSize: input });
          
          addMessage(
            `Таны өгсөн мэдээлэлд үндэслэн урьдчилсан тооцоо хийлээ:
            
📊 Төслийн төрөл: ${projectData.projectType}
⏱️ Тооцоолсон хугацаа: ${estimateData.weeks} долоо хоног
👥 Багийн хэмжээ: ${input}
💰 Тооцоолсон үнэ: ₮${estimateData.price?.toLocaleString()}

Дэлгэрэнгүй үнийн санал авахыг хүсвэл доорх товчийг дарна уу!`,
            'bot',
            ['Дэлгэрэнгүй үнийн санал авах', 'Өөр төсөл тооцуулах']
          );
          break;
      }
    }, 1000);
  };

  const calculateEstimate = (data: any) => {
    let basePrice = 500000; // Base price
    let weeks = 2;
    
    // Adjust based on project type
    switch (data.projectType) {
      case 'Вэб сайт':
        basePrice = 800000;
        weeks = 3;
        break;
      case 'Мобайл апп':
        basePrice = 1200000;
        weeks = 6;
        break;
      case 'Odoo ERP':
        basePrice = 2000000;
        weeks = 12;
        break;
      default:
        basePrice = 600000;
        weeks = 4;
    }
    
    // Adjust based on team size
    const teamMultiplier = data.teamSize?.includes('1 хүн') ? 1 : 
                          data.teamSize?.includes('2-3') ? 1.5 :
                          data.teamSize?.includes('4-6') ? 2 : 2.5;
    
    return {
      price: Math.round(basePrice * teamMultiplier),
      weeks: Math.round(weeks * teamMultiplier * 0.8),
      teamSize: data.teamSize
    };
  };

  const handleQuoteRequest = (option: string) => {
    if (option === 'Дэлгэрэнгүй үнийн санал авах') {
      const estimateData = calculateEstimate(projectData);
      onQuoteRequest({
        projectType: projectData.projectType,
        description: projectData.details,
        teamSize: projectData.teamSize,
        estimatedPrice: estimateData.price,
        estimatedWeeks: estimateData.weeks
      });
      setIsOpen(false);
    } else if (option === 'Өөр төсөл тооцуулах') {
      setMessages([messages[0]]);
      setChatState('greeting');
      setProjectData({});
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        size="lg"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className={`fixed bottom-6 right-6 w-96 shadow-xl z-50 transition-all duration-300 ${
      isMinimized ? 'h-14' : 'h-[600px]'
    }`}>
      <CardHeader className="pb-3 bg-primary text-primary-foreground rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bot className="h-5 w-5" />
            Provision AI туслах
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-8 w-8 p-0 text-primary-foreground hover:bg-primary-foreground/20"
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0 text-primary-foreground hover:bg-primary-foreground/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="p-0 flex flex-col h-[calc(600px-80px)]">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.sender === 'user' ? 'bg-primary' : 'bg-muted'
                    }`}>
                      {message.sender === 'user' ? 
                        <User className="h-4 w-4 text-primary-foreground" /> : 
                        <Bot className="h-4 w-4 text-muted-foreground" />
                      }
                    </div>
                    <div>
                      <div className={`p-3 rounded-lg ${
                        message.sender === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                      </div>
                      {message.options && (
                        <div className="mt-2 space-y-1">
                          {message.options.map((option, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (chatState === 'quote' && (option.includes('үнийн санал') || option.includes('төсөл'))) {
                                  handleQuoteRequest(option);
                                } else {
                                  handleOptionClick(option);
                                }
                              }}
                              className="block w-full text-left text-xs"
                            >
                              {option}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Мессеж бичнэ үү..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} size="sm">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}