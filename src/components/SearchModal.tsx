import React, { useState, useEffect, useRef } from 'react';
import { Search, Paperclip, User, Settings, Play, Folder, Image, Loader2, Link, ExternalLink, Check } from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'person' | 'file' | 'folder' | 'chat' | 'list';
  name: string;
  status?: string;
  details?: string;
  avatar?: string;
  icon?: React.ReactNode;
}


const mockData: SearchResult[] = [
  {
    id: '1',
    type: 'person',
    name: 'Randall Johnsson',
    status: 'Active now',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face'
  },
  {
    id: '2',
    type: 'folder',
    name: 'Random Michal Folder',
    details: '12 Files • in Photos • Edited 12m ago',
    icon: <Folder className="w-5 h-5 text-gray-500" />
  },
  {
    id: '3',
    type: 'file',
    name: 'crative_file_frandkies.jpg',
    details: 'in Photos/Assets • Edited 12m ago',
    icon: <Image className="w-5 h-5 text-gray-500" />
  },
  {
    id: '4',
    type: 'person',
    name: 'Kristinge Karand',
    status: 'Active 2d ago',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face'
  },
  {
    id: '5',
    type: 'file',
    name: 'files_krande_michelle.avi',
    details: 'in Videos • Added 12m ago',
    icon: <Play className="w-5 h-5 text-gray-500" />
  }
];

const SearchModal: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'files' | 'people' | 'chats' | 'lists'>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showResults, setShowResults] = useState(true);
  const [isCleared, setIsCleared] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    files: true,
    people: true,
    chats: false,
    lists: false
  });
  const settingsRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  // Close settings dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Handle typing animation
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Only start opening animation if we have text and are in cleared state
    if (value.length > 0 && isCleared) {
      setIsCleared(false);
      setIsOpening(true);
      setIsFocused(true);
      setIsTyping(true);
      setShowResults(false);
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set timeout to complete opening animation
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        setShowResults(true);
        setIsOpening(false);
      }, 500);
    } else if (value.length > 0) {
      // Normal typing behavior when not in cleared state
      setIsFocused(true);
      setIsTyping(true);
      setShowResults(false);

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to stop loading animation
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        setShowResults(true);
      }, 500);
    } else {
      // If text is cleared, go back to cleared state
      setIsCleared(true);
      setIsFocused(false);
      setIsTyping(false);
      setShowResults(false);
      setIsOpening(false);
    }
  };

  // Handle clear button
  const handleClear = () => {
    setIsClearing(true);
    setShowResults(false);
    
    // Animate the clearing transition
    setTimeout(() => {
      setSearchQuery('');
      setIsTyping(false);
      setIsFocused(false);
      setIsCleared(true);
      setIsClearing(false);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Blur the input to remove focus
      const input = document.querySelector('input[type="text"]') as HTMLInputElement;
      if (input) input.blur();
    }, 250); // 250ms animation duration for smoother feel
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-orange-200 text-orange-800">
          {part}
        </span>
      ) : part
    );
  };

  // Handle filter toggle changes
  const handleFilterToggle = (filterType: keyof typeof filters) => {
    setFilters(prev => {
      const newFilters = {
        ...prev,
        [filterType]: !prev[filterType]
      };
      
      // If the currently active tab is being disabled, switch to 'all'
      if (!newFilters[filterType]) {
        if ((filterType === 'files' && activeTab === 'files') ||
            (filterType === 'people' && activeTab === 'people') ||
            (filterType === 'chats' && activeTab === 'chats') ||
            (filterType === 'lists' && activeTab === 'lists')) {
          setActiveTab('all');
        }
      }
      
      return newFilters;
    });
  };

  const filteredResults = mockData.filter(result => {
    // First filter by active tab
    if (activeTab === 'files') return result.type === 'file' || result.type === 'folder';
    if (activeTab === 'people') return result.type === 'person';
    if (activeTab === 'chats') return result.type === 'chat';
    if (activeTab === 'lists') return result.type === 'list';
    
    // For 'all' tab, filter by enabled filters
    if (result.type === 'person') return filters.people;
    if (result.type === 'file' || result.type === 'folder') return filters.files;
    if (result.type === 'chat') return filters.chats;
    if (result.type === 'list') return filters.lists;
    
    return true;
  });

  const getResultIcon = (result: SearchResult) => {
    if (result.type === 'person') {
      return (
        <div className="relative">
          <img 
            src={result.avatar} 
            alt={result.name}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
          />
          <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white"></div>
        </div>
      );
    }
    return (
      <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
        {result.icon}
      </div>
    );
  };

  const getStatusColor = (status?: string) => {
    if (status?.includes('Active now')) return 'text-green-600';
    if (status?.includes('Active')) return 'text-gray-500';
    return 'text-gray-400';
  };

  // Handle copying link
  const handleCopyLink = async (result: SearchResult) => {
    const link = `https://example.com/${result.type}/${result.id}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedItem(result.id);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  // Handle opening in new tab
  const handleOpenNewTab = (result: SearchResult) => {
    const link = `https://example.com/${result.type}/${result.id}`;
    window.open(link, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-2">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl p-4 sm:p-6">
        {/* Search Bar */}
        <div className="relative  mb-4 sm:mb-0">
          {isCleared ? (
            <div 
              className="w-full  pr-20 sm:pr-24 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-lg sm:rounded-xl bg-white flex items-center cursor-text transition-all duration-300 ease-out animate-fadeInUp"
              onClick={() => {
                setIsCleared(false);
                // Focus the input after state change
                setTimeout(() => {
                  const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                  if (input) input.focus();
                }, 0);
              }}
            >
              <Search className="absolute font-medium  top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-gray-400 pl-5 sm:pl-6 font-medium text-lg relative">
                Searching is easier
                <div className="absolute -top-1 left-1 w-1 h-1 bg-gray-400 rounded-full animate-pulse"></div>
              </span>
              <div className="ml-auto flex items-center space-x-2">
                <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-xs text-gray-500">s</span>
                </div>
                <span className="text-gray-400 text-xs">quick access</span>
              </div>
            </div>
          ) : (
            <>
              {isTyping ? (
                <Loader2 className="absolute  top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              ) : (
                <Search className="absolute  top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              )}
               <input
                 type="text"
                 value={searchQuery}
                 onChange={handleSearchChange}
                 onFocus={() => {
                   // Don't open on focus, only when typing
                 }}
                 onBlur={() => {
                   if (!searchQuery) {
                     setIsFocused(false);
                   }
                 }}
                 placeholder=" "
                 className="w-full pl-6 pr-16 placeholder:text-medium text-black font-medium sm:pr-20 py-2.5 sm:py-3 text-sm sm:text-lg focus:outline-none border-0 border-none focus:border-none focus:ring-0"
               />
               {!searchQuery && (
                 <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                   <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center">
                     <span className="text-xs text-gray-500">s</span>
                   </div>
                   <span className="text-gray-400 text-xs whitespace-nowrap">quick access</span>
                 </div>
               )}
              {searchQuery && (
                <button
                  onClick={handleClear}
                  className="absolute cursor-pointer right-3 sm:right-4 top-1/2 transform -translate-y-1/2 font-medium hover:text-gray-600 text-sm sm:text-base underline"
                >
                  Clear
                </button>
              )}
            </>
          )}
        </div>

        {/* Filter Tabs */}
        {!isCleared && isFocused && (
          <div className={`flex items-center justify-between mb-4 sm:mb-6 transition-all duration-300 ease-out ${
            isClearing ? 'opacity-0 transform -translate-y-3 scale-95' : 
            isOpening ? 'opacity-0 transform translate-y-3 scale-95' : 
            'opacity-100 transform translate-y-0 scale-100'
          }`}>
          <div className="flex space-x-4 sm:space-x-6 md:space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`pb-2 cursor-pointer border-b-2 whitespace-nowrap text-xs sm:text-sm ${
                activeTab === 'all' 
                  ? 'border-black text-black' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              All {filteredResults.length}
            </button>
            {filters.files && (
              <button
                onClick={() => setActiveTab('files')}
                className={`pb-2 cursor-pointer border-b-2 flex items-center space-x-1 sm:space-x-2 whitespace-nowrap text-xs sm:text-sm ${
                  activeTab === 'files' 
                    ? 'border-black text-black' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Paperclip className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Files {mockData.filter(r => (r.type === 'file' || r.type === 'folder') && filters.files).length}</span>
                <span className="sm:hidden">{mockData.filter(r => (r.type === 'file' || r.type === 'folder') && filters.files).length}</span>
              </button>
            )}
            {filters.people && (
              <button
                onClick={() => setActiveTab('people')}
                className={`pb-2 cursor-pointer border-b-2 flex items-center space-x-1 sm:space-x-2 whitespace-nowrap text-xs sm:text-sm ${
                  activeTab === 'people' 
                    ? 'border-black text-black' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <User className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">People {mockData.filter(r => r.type === 'person' && filters.people).length}</span>
                <span className="sm:hidden">{mockData.filter(r => r.type === 'person' && filters.people).length}</span>
              </button>
            )}
            {filters.chats && (
              <button
                onClick={() => setActiveTab('chats')}
                className={`pb-2 cursor-pointer border-b-2 flex items-center space-x-1 sm:space-x-2 whitespace-nowrap text-xs sm:text-sm ${
                  activeTab === 'chats' 
                    ? 'border-black text-black' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-300 rounded"></div>
                <span className="hidden sm:inline">Chats {mockData.filter(r => r.type === 'chat' && filters.chats).length}</span>
                <span className="sm:hidden">{mockData.filter(r => r.type === 'chat' && filters.chats).length}</span>
              </button>
            )}
            {filters.lists && (
              <button
                onClick={() => setActiveTab('lists')}
                className={`pb-2 cursor-pointer border-b-2 flex items-center space-x-1 sm:space-x-2 whitespace-nowrap text-xs sm:text-sm ${
                  activeTab === 'lists' 
                    ? 'border-black text-black' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-300 rounded"></div>
                <span className="hidden sm:inline">Lists {mockData.filter(r => r.type === 'list' && filters.lists).length}</span>
                <span className="sm:hidden">{mockData.filter(r => r.type === 'list' && filters.lists).length}</span>
              </button>
            )}
          </div>
          
          {/* Settings Dropdown */}
          <div className="relative flex-shrink-0" ref={settingsRef}>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1.5 cursor-pointer sm:p-2 hover:bg-gray-100 rounded-lg"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
            </button>
            
            {showSettings && (
              <div className="absolute right-0 top-full mt-2 w-40 sm:w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="p-2 sm:p-3 space-y-1">
                  <div 
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => handleFilterToggle('files')}
                  >
                    <div className="flex items-center space-x-1.5 sm:space-x-2">
                      <Paperclip className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                      <span className="text-xs sm:text-sm">Files</span>
                    </div>
                    <div className={`w-8 h-4 sm:w-10 sm:h-5 rounded-full ${filters.files ? 'bg-black' : 'bg-gray-300'} relative`}>
                      <div className={`w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full absolute top-0.5 transition-transform ${filters.files ? 'translate-x-4 sm:translate-x-5' : 'translate-x-0.5'}`}></div>
                    </div>
                  </div>
                  
                  <div 
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => handleFilterToggle('people')}
                  >
                    <div className="flex items-center space-x-1.5 sm:space-x-2">
                      <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                      <span className="text-xs sm:text-sm">People</span>
                    </div>
                    <div className={`w-8 h-4 sm:w-10 sm:h-5 rounded-full ${filters.people ? 'bg-black' : 'bg-gray-300'} relative`}>
                      <div className={`w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full absolute top-0.5 transition-transform ${filters.people ? 'translate-x-4 sm:translate-x-5' : 'translate-x-0.5'}`}></div>
                    </div>
                  </div>
                  
                  <div 
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => handleFilterToggle('chats')}
                  >
                    <div className="flex items-center space-x-1.5 sm:space-x-2">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-300 rounded"></div>
                      <span className="text-xs sm:text-sm">Chats</span>
                    </div>
                    <div className={`w-8 h-4 sm:w-10 sm:h-5 rounded-full ${filters.chats ? 'bg-black' : 'bg-gray-300'} relative`}>
                      <div className={`w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full absolute top-0.5 transition-transform ${filters.chats ? 'translate-x-4 sm:translate-x-5' : 'translate-x-0.5'}`}></div>
                    </div>
                  </div>
                  
                  <div 
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => handleFilterToggle('lists')}
                  >
                    <div className="flex items-center space-x-1.5 sm:space-x-2">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-300 rounded"></div>
                      <span className="text-xs sm:text-sm">Lists</span>
                    </div>
                    <div className={`w-8 h-4 sm:w-10 sm:h-5 rounded-full ${filters.lists ? 'bg-black' : 'bg-gray-300'} relative`}>
                      <div className={`w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full absolute top-0.5 transition-transform ${filters.lists ? 'translate-x-4 sm:translate-x-5' : 'translate-x-0.5'}`}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        )}

        {/* Search Results */}
        {!isCleared && isFocused && (
          <div className={`transition-all duration-300 ease-out  ${
            isClearing ? 'opacity-0 transform translate-y-6 scale-95' : 
            isOpening ? 'opacity-0 transform -translate-y-6 scale-95' : 
            'opacity-100 transform translate-y-0 scale-100'
          }`}>
          {showResults ? (
            filteredResults.map((result, index) => {
              const delayClass = index === 0 ? '' : index === 1 ? 'animate-delay-100' : index === 2 ? 'animate-delay-200' : index === 3 ? 'animate-delay-300' : index === 4 ? 'animate-delay-400' : 'animate-delay-500';
              return (
                <div 
                  key={result.id} 
                  className={`flex items-center space-x-3 sm:space-x-4 py-2 sm:py-3 hover:bg-gray-50 rounded-lg cursor-pointer animate-fadeInUp ${delayClass} group relative`}
                  onMouseEnter={() => setHoveredItem(result.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                <div className="flex-shrink-0">
                  {getResultIcon(result)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                    {highlightText(result.name, searchQuery)}
                  </div>
                  {result.status && (
                    <div className={`text-xs ${getStatusColor(result.status)}`}>
                      {result.status}
                    </div>
                  )}
                  {result.details && (
                    <div className="text-xs text-gray-500 truncate">
                      {result.details}
                    </div>
                  )}
                </div>

                {(hoveredItem === result.id || result.type === 'file' || result.type === 'folder') && (
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyLink(result);
                      }}
                      className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors relative"
                      title="Copy link"
                    >
                      {copiedItem === result.id ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Link className="w-4 h-4 text-gray-500" />
                      )}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenNewTab(result);
                      }}
                      className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                )}

                {copiedItem === result.id && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                    Link copied!
                  </div>
                )}
              </div>
              );
            })
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {[1, 2, 3, 4, 5].map((index) => (
                <div 
                  key={index}
                  className="flex items-center space-x-3 sm:space-x-4 p-2 sm:p-3 animate-pulse"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-2 sm:h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
};

export default SearchModal;
