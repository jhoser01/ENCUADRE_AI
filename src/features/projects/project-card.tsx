import React from 'react';
import Link from 'next/link';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PROJECT_STATUS_LABELS } from '@/constants';
import { formatDate, formatScore } from '@/lib/utils/format';
import type { Project, Client } from '@/types/database';

export interface ProjectCardProps {
  project: Project & { clients?: Client | null };
}

export function ProjectCard({ project }: ProjectCardProps) {
  const statusMeta = PROJECT_STATUS_LABELS[project.status] || {
    label: project.status,
    variant: 'active' as const,
  };

  const hasScore = project.alignment_score !== null && project.alignment_score !== undefined;

  return (
    <Card gradientBorder className="flex flex-col justify-between group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-[#7C3DFF] font-semibold">
              {project.type}
            </span>
            <CardTitle className="group-hover:text-[#45E679] transition-colors line-clamp-1">
              {project.name}
            </CardTitle>
          </div>
          <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-3">
        {project.clients && (
          <div className="flex items-center gap-2 text-xs text-[#A9A7B7]">
            <User className="h-3.5 w-3.5 text-[#7C3DFF]" />
            <span className="truncate">{project.clients.name}</span>
          </div>
        )}

        {project.event_date && (
          <div className="flex items-center gap-2 text-xs text-[#A9A7B7]">
            <Calendar className="h-3.5 w-3.5 text-[#7C3DFF]" />
            <span>{formatDate(project.event_date)}</span>
          </div>
        )}

        {/* Alignment Mini Score Preview */}
        {hasScore && (
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#080714]/60 border border-[#7C3DFF]/20">
            <span className="text-xs text-[#A9A7B7]">Alignment Score:</span>
            <span className="font-poppins text-sm font-bold text-[#16C95A]">
              {formatScore(project.alignment_score)}
            </span>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2 border-t border-[#7C3DFF]/10 flex justify-end">
        <Link
          href={`/app/projects/${project.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7C3DFF] group-hover:text-[#45E679] transition-colors"
        >
          <span>Ver proyecto</span>
          <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform" />
        </Link>
      </CardFooter>
    </Card>
  );
}
