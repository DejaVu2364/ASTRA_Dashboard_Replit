import * as React from 'react';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import Sidebar from './Sidebar';

interface DashboardProps {
  children: React.ReactNode;
  activeRoute: string;
  onNavigate: (route: string) => void;
}

/**
 * A modern, responsive layout component for the main application dashboard.
 * It features a collapsible, resizable sidebar for navigation and a main content area.
 */
export function Dashboard({ children, activeRoute, onNavigate }: DashboardProps) {
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="min-h-screen w-full rounded-lg border-none bg-obsidian"
    >
      <ResizablePanel
        defaultSize={18}
        minSize={15}
        maxSize={25}
        className="min-w-[250px] max-w-[350px]"
      >
        <Sidebar activeRoute={activeRoute} onNavigate={onNavigate} />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={82}>
        <div className="flex h-full items-start justify-center p-6 overflow-auto">
          {children}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
