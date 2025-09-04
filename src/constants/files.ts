import { BookOpen, FileText, PenTool, HelpCircle, GraduationCap, FlaskConical, Archive, Presentation } from 'lucide-react';

export const FILE_CATEGORIES = [
  'Class Lectures',
  'Class Notes',
  'Notes(Chotha)',
  'Questions',
  'Lab Reports',
  'Reference Books',
  'Others',
  'Senior Materials'
];

export const CATEGORY_DETAILS = [
  {
    name: 'All',
    icon: Archive,
    color: 'from-gray-600 to-gray-800'
  },
  {
    name: 'Class Lectures',
    icon: Presentation,
    color: 'from-blue-500 to-blue-700'
  },
  {
    name: 'Class Notes',
    icon: FileText,
    color: 'from-green-500 to-green-700'
  },
  {
    name: 'Notes(Chotha)',
    icon: PenTool,
    color: 'from-purple-500 to-purple-700'
  },
  {
    name: 'Questions',
    icon: HelpCircle,
    color: 'from-red-500 to-red-700'
  },
  {
    name: 'Lab Reports',
    icon: FlaskConical,
    color: 'from-indigo-500 to-indigo-700'
  },
  {
    name: 'Reference Books',
    icon: BookOpen,
    color: 'from-teal-500 to-teal-700'
  },
  {
    name: 'Others',
    icon: Archive,
    color: 'from-gray-500 to-gray-700'
  },
  {
    name: 'Senior Materials',
    icon: GraduationCap,
    color: 'from-yellow-500 to-yellow-700'
  }
];
