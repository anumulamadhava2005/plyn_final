
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Calendar, Clock, X, User, Tag } from 'lucide-react';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

// Mock notifications data
const mockNotifications = [
  {
    id: '1',
    type: 'appointment',
    title: 'Upcoming Appointment',
    message: 'Your appointment at Modern Cuts is tomorrow at 2:00 PM',
    time: '23 hours ago',
    read: false
  },
  {
    id: '2',
    type: 'promotion',
    title: '25% Off Color Services',
    message: 'Enjoy a special discount on all color services until the end of the month!',
    time: '2 days ago',
    read: true
  },
  {
    id: '3',
    type: 'appointment',
    title: 'Appointment Reminder',
    message: 'Your appointment at Elegance Hair Studio is in 3 days',
    time: '1 day ago',
    read: false
  },
  {
    id: '4',
    type: 'system',
    title: 'Profile Updated',
    message: 'Your profile information has been successfully updated',
    time: '1 week ago',
    read: true
  },
  {
    id: '5',
    type: 'promotion',
    title: 'New Salon Added',
    message: 'The Hair Lounge has joined our platform! Check out their services',
    time: '2 weeks ago',
    read: true
  }
];

const NotificationsPopover = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [activeTab, setActiveTab] = useState('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    
    // Navigate based on notification type
    if (notification.type === 'appointment') {
      navigate('/my-bookings');
    } else if (notification.type === 'promotion') {
      navigate('/book-now');
    } else if (notification.type === 'system') {
      navigate('/profile');
    }
    
    setOpen(false);
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.read;
    return notification.type === activeTab;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="w-4 h-4" />;
      case 'promotion':
        return <Tag className="w-4 h-4" />;
      case 'system':
        return <User className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-full hover:bg-accent/50 focus:outline-none">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 md:w-96 p-0 max-h-[80vh] flex flex-col" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="text-xs text-primary hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>
        
        <Tabs 
          defaultValue="all" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col"
        >
          <TabsList className="grid grid-cols-4 px-2">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="appointment" className="text-xs">Appointments</TabsTrigger>
            <TabsTrigger value="promotion" className="text-xs">Promotions</TabsTrigger>
            <TabsTrigger value="unread" className="text-xs">Unread</TabsTrigger>
          </TabsList>
          
          <div className="flex-1 overflow-y-auto max-h-[50vh]">
            <TabsContent value={activeTab} className="m-0">
              {filteredNotifications.length > 0 ? (
                <AnimatePresence initial={false}>
                  {filteredNotifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        "p-3 border-b last:border-0 cursor-pointer hover:bg-accent/50 transition-colors",
                        !notification.read && "bg-accent/20"
                      )}
                    >
                      <div className="flex" onClick={() => handleNotificationClick(notification)}>
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center mr-3",
                          notification.type === 'appointment' && "bg-primary/10 text-primary",
                          notification.type === 'promotion' && "bg-orange-500/10 text-orange-500",
                          notification.type === 'system' && "bg-blue-500/10 text-blue-500"
                        )}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 pr-6">
                          <div className="flex justify-between items-start">
                            <h4 className={cn(
                              "text-sm font-medium",
                              !notification.read && "font-semibold"
                            )}>
                              {notification.title}
                            </h4>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="text-muted-foreground hover:text-foreground ml-1"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-muted-foreground">
                              {notification.time}
                            </span>
                            {!notification.read && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="text-xs text-primary hover:underline"
                              >
                                Mark as read
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
                  <Bell className="text-muted-foreground mb-2 h-8 w-8" />
                  <p className="text-sm font-medium mb-1">No notifications</p>
                  <p className="text-xs text-muted-foreground">
                    You don't have any {activeTab !== 'all' ? activeTab : ''} notifications.
                  </p>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
        
        <div className="p-3 border-t">
          <AnimatedButton 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => {
              navigate('/my-bookings');
              setOpen(false);
            }}
          >
            View All Bookings
          </AnimatedButton>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsPopover;
