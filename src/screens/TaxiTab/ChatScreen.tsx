// ChatScreen.tsx - Re-export from modular chat components
// Original file backed up as ChatScreen.legacy.tsx (3,275 lines)
// New modular structure:
// - src/hooks/taxi/useChatScreen.ts - Business logic hook
// - src/screens/TaxiTab/chat/index.tsx - Main container
// - src/screens/TaxiTab/chat/ChatMessageList.tsx - Message rendering
// - src/screens/TaxiTab/chat/ChatInput.tsx - Input UI
// - src/screens/TaxiTab/chat/ChatMenu.tsx - Action menu
// - src/screens/TaxiTab/chat/JoinRequestSection.tsx - Join requests
// - src/screens/TaxiTab/chat/SettlementBar.tsx - Settlement status bar
// - src/screens/TaxiTab/chat/SideMenu.tsx - Side menu
// - src/screens/TaxiTab/chat/ChatModals.tsx - All modals

export { ChatScreen } from './chat';
