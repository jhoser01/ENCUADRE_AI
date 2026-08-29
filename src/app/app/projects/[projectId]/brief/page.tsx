'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle2, FileText, Sparkles, RefreshCw, Check, Clock, UserCheck, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { generateVisualBriefAction, approveBriefAction } from '@/server/actions/briefs';
import { createBrowserClient } from '@/lib/supabase/browser';
import type { Brief, BriefApproval } from '@/types/database';

export default function ProjectBriefPage() {
  const params = useParams<{ projectId: string }>();
  const router = useRouter();
  const projectId = params.projectId;

  const [brief, setBrief] = useState<Brief | null>(null);
  const [approvals, setApprovals] = useState<BriefApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBrief = async () => {
    setLoading(true);
    const supabase = createBrowserClient();

    const { data: briefData } = (await supabase
      .from('briefs')
      .select('*, brief_approvals(*)')
      .eq('project_id', projectId)
      .order('version', { ascending: false })
      .limit(1)
      .single()) as any;

    if (briefData) {
      setBrief(briefData);
      setApprovals(briefData.brief_approvals || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadBrief();
  }, [projectId]);

  const handleGenerateBrief = async () => {
    setIsGenerating(true);
    setError(null);
    const res = await generateVisualBriefAction(projectId);
    if (res.success && res.brief) {
      setBrief(res.brief);
      setApprovals([]);
    } else {
      setError(res.error || 'Error al generar el Visual Brief.');
    }
    setIsGenerating(false);
  };

  const handleApprove = async () => {
    if (!brief) return;
    setIsApproving(true);
    setError(null);
    const res = await approveBriefAction({
      briefId: brief.id,
      actorType: 'photographer',
      comment: 'Aprobado por el fotógrafo.',
    });

    if (res.success) {
      await loadBrief();
    } else {
      setError(res.error || 'Error al registrar la aprobación.');
    }
    setIsApproving(false);
  };

  const photographerApproved = approvals.some((a) => a.actor_type === 'photographer');
  const clientApproved = approvals.some((a) => a.actor_type === 'client');
  const fullyApproved = photographerApproved && clientApproved;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#7C3DFF]/15 pb-5">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#7C3DFF] font-semibold">
            Acuerdo Visual
          </span>
          <h1 className="font-poppins text-2xl md:text-3xl font-bold text-white tracking-tight">
            Visual Brief
          </h1>
        </div>

        <div className="flex items-center gap-2 bg-[#100A2E] p-1 rounded-lg border border-[#7C3DFF]/20">
          <Link
            href={`/app/projects/${projectId}`}
            className="px-3 py-1.5 rounded-md text-xs font-medium text-[#A9A7B7] hover:text-white hover:bg-white/5"
          >
            Resumen
          </Link>
          <Link
            href={`/app/projects/${projectId}/alignment`}
            className="px-3 py-1.5 rounded-md text-xs font-medium text-[#A9A7B7] hover:text-white hover:bg-white/5"
          >
            Alineación
          </Link>
          <Link
            href={`/app/projects/${projectId}/brief`}
            className="px-3 py-1.5 rounded-md text-xs font-semibold bg-[#7C3DFF] text-white"
          >
            Visual Brief
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-[#E5484D]/15 border border-[#E5484D]/30 text-xs text-[#E5484D]">
          {error}
        </div>
      )}

      {/* Dual Approval Status Banner */}
      {brief && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            className={`p-4 rounded-xl border flex items-center justify-between ${
              photographerApproved
                ? 'bg-[#16C95A]/10 border-[#16C95A]/40 text-[#16C95A]'
                : 'bg-[#F5A524]/10 border-[#F5A524]/30 text-[#F5A524]'
            }`}
          >
            <div className="flex items-center gap-3">
              <UserCheck className="h-5 w-5" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider">Fotógrafo</p>
                <p className="text-sm font-bold text-white">
                  {photographerApproved ? 'Aprobado ✓' : 'Pendiente de aprobación'}
                </p>
              </div>
            </div>
            {!photographerApproved && (
              <Button
                variant="primary"
                size="sm"
                loading={isApproving}
                onClick={handleApprove}
                className="text-xs"
              >
                Aprobar Brief
              </Button>
            )}
          </div>

          <div
            className={`p-4 rounded-xl border flex items-center justify-between ${
              clientApproved
                ? 'bg-[#16C95A]/10 border-[#16C95A]/40 text-[#16C95A]'
                : 'bg-[#F5A524]/10 border-[#F5A524]/30 text-[#F5A524]'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider">Cliente</p>
                <p className="text-sm font-bold text-white">
                  {clientApproved ? 'Aprobado ✓' : 'Pendiente de aprobación'}
                </p>
              </div>
            </div>
            {fullyApproved && (
              <Badge variant="aligned" className="text-xs">
                Brief Acordado
              </Badge>
            )}
          </div>
        </div>
      )}

      {!brief && !loading ? (
        <Card className="p-12 text-center bg-[#100A2E] border-[#7C3DFF]/30 space-y-4">
          <div className="mx-auto p-4 rounded-full bg-[#7C3DFF]/15 text-[#7C3DFF] w-fit">
            <Sparkles className="h-8 w-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="font-poppins text-lg font-bold text-white">
              Genera el Visual Brief con Inteligencia Artificial
            </h3>
            <p className="text-xs text-[#A9A7B7]">
              Sintetiza la dirección visual, prioridades, tomas indispensables y acuerdos de edición a partir de los datos de la sesión.
            </p>
          </div>
          <Button
            variant="primary"
            loading={isGenerating}
            onClick={handleGenerateBrief}
            className="gap-2 shadow-glow-purple"
          >
            <Sparkles className="h-4 w-4" />
            <span>Generar Visual Brief ahora</span>
          </Button>
        </Card>
      ) : brief ? (
        <div data-testid="brief-content" className="space-y-6">
          <Card className="bg-[#100A2E] border-[#7C3DFF]/30">
            <CardHeader className="flex flex-row items-center justify-between border-b border-[#7C3DFF]/15 pb-4">
              <div>
                <span className="text-xs text-[#45E679] font-bold uppercase tracking-wider">
                  Versión {brief.version}
                </span>
                <CardTitle className="text-xl font-bold text-white mt-0.5">
                  Resumen de Acuerdo Visual
                </CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                loading={isGenerating}
                onClick={handleGenerateBrief}
                className="text-xs gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Regenerar con IA</span>
              </Button>
            </CardHeader>

            <CardContent className="space-y-6 pt-6 text-sm">
              {/* Summary */}
              <div className="p-4 rounded-xl bg-[#080714] border border-[#7C3DFF]/20">
                <p className="text-white font-medium leading-relaxed">{brief.content.summary}</p>
              </div>

              {/* Visual Direction & Priorities Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2.5 p-4 rounded-xl bg-[#080714]/60 border border-[#7C3DFF]/15">
                  <h4 className="text-xs font-bold text-[#7C3DFF] uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    Dirección Visual Acordada
                  </h4>
                  <ul className="space-y-1.5 text-xs text-[#F7F7FB]/90 list-disc list-inside">
                    {brief.content.visualDirection.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2.5 p-4 rounded-xl bg-[#080714]/60 border border-[#7C3DFF]/15">
                  <h4 className="text-xs font-bold text-[#16C95A] uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    Prioridades de la Sesión
                  </h4>
                  <ul className="space-y-1.5 text-xs text-[#F7F7FB]/90 list-disc list-inside">
                    {brief.content.priorityAttributes.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Must-have Shots & Avoid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2.5 p-4 rounded-xl bg-[#080714]/60 border border-[#7C3DFF]/15">
                  <h4 className="text-xs font-bold text-[#45E679] uppercase tracking-wider">
                    Tomas Indispensables (Must-Have Shots)
                  </h4>
                  <ul className="space-y-1.5 text-xs text-[#F7F7FB]/90 list-disc list-inside">
                    {brief.content.mustHaveShots.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2.5 p-4 rounded-xl bg-[#080714]/60 border border-[#E5484D]/20">
                  <h4 className="text-xs font-bold text-[#E5484D] uppercase tracking-wider">
                    Evitar o Minimizar
                  </h4>
                  <ul className="space-y-1.5 text-xs text-[#F7F7FB]/90 list-disc list-inside">
                    {brief.content.avoid.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Editing Expectations */}
              <div className="space-y-2 p-4 rounded-xl bg-[#080714]/60 border border-[#7C3DFF]/15">
                <h4 className="text-xs font-bold text-[#A9A7B7] uppercase tracking-wider">
                  Acuerdo de Edición y Retoque
                </h4>
                <p className="text-xs text-[#F7F7FB]/90 leading-relaxed">
                  {brief.content.editingExpectations}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
