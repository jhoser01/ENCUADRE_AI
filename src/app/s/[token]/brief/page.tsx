'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle2, ShieldCheck, Heart, Sparkles, Check, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { approveBriefAction } from '@/server/actions/briefs';
import { createBrowserClient } from '@/lib/supabase/browser';
import { LoadingSpinner } from '@/components/feedback/loading-spinner';
import type { Brief, BriefApproval } from '@/types/database';

export default function ClientBriefApprovalPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;

  const [brief, setBrief] = useState<Brief | null>(null);
  const [approvals, setApprovals] = useState<BriefApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [justApproved, setJustApproved] = useState(false);

  const loadBrief = async () => {
    setLoading(true);
    const supabase = createBrowserClient();

    // Fetch latest brief through session
    const { data: session } = (await supabase
      .from('client_sessions')
      .select('project_id')
      .limit(1)
      .single()) as any;

    if (session?.project_id) {
      const { data: briefData } = (await supabase
        .from('briefs')
        .select('*, brief_approvals(*)')
        .eq('project_id', session.project_id)
        .order('version', { ascending: false })
        .limit(1)
        .single()) as any;

      if (briefData) {
        setBrief(briefData);
        setApprovals(briefData.brief_approvals || []);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadBrief();
  }, [token]);

  const handleClientApprove = async () => {
    if (!brief) return;
    setIsApproving(true);

    const res = await approveBriefAction({
      briefId: brief.id,
      actorType: 'client',
      comment: 'Aprobado por el cliente desde el enlace móvil.',
    });

    if (res.success) {
      setJustApproved(true);
      await loadBrief();
    }
    setIsApproving(false);
  };

  const clientApproved = approvals.some((a) => a.actor_type === 'client') || justApproved;
  const photographerApproved = approvals.some((a) => a.actor_type === 'photographer');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" label="Cargando tu Visual Brief..." />
      </div>
    );
  }

  // Fallback demo content if no brief generated yet
  const displayBrief = brief?.content || {
    summary: 'Acuerdo visual enfocado en momentos genuinos, calidez de luz natural y texturas auténticas.',
    visualDirection: ['Luz natural suave', 'Momentos espontáneos', 'Composición limpia'],
    priorityAttributes: ['Emoción genuina', 'Retratos cercanos'],
    mustHaveShots: ['Tomas principales', 'Interacciones naturales'],
    avoid: ['Poses rígidas de catálogo'],
    editingExpectations: 'Edición natural con textura de piel cuidada y balance de color cálido.',
  };

  return (
    <div className="space-y-6 max-w-md mx-auto my-auto w-full">
      {/* Header */}
      <div className="text-center space-y-1">
        <span className="text-xs font-bold text-[#16C95A] uppercase tracking-wider">
          Acuerdo Visual de la Sesión
        </span>
        <h1 className="font-poppins text-2xl font-bold text-[#080714]">
          Tu Visual Brief
        </h1>
        <p className="text-xs text-[#626171]">
          Este documento resume la dirección estética que acordamos para tu sesión.
        </p>
      </div>

      {/* Approval Status Chips */}
      <div className="flex items-center justify-center gap-3 text-xs">
        <span
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full border font-medium ${
            photographerApproved
              ? 'bg-[#16C95A]/10 text-[#16C95A] border-[#16C95A]/30'
              : 'bg-[#EEEEF5] text-[#626171] border-transparent'
          }`}
        >
          {photographerApproved ? <Check className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
          <span>Fotógrafo: {photographerApproved ? 'Aprobado' : 'Revisando'}</span>
        </span>

        <span
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full border font-medium ${
            clientApproved
              ? 'bg-[#16C95A]/10 text-[#16C95A] border-[#16C95A]/30'
              : 'bg-[#7C3DFF]/10 text-[#7C3DFF] border-[#7C3DFF]/30'
          }`}
        >
          {clientApproved ? <Check className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
          <span>Tú: {clientApproved ? 'Aprobado ✓' : 'Pendiente'}</span>
        </span>
      </div>

      {/* Brief Card */}
      <Card className="bg-white border-[#EEEEF5] shadow-sm">
        <CardContent className="space-y-5 pt-6 text-xs text-[#080714]">
          {/* Summary */}
          <div className="p-3.5 rounded-lg bg-[#F7F7FB] border border-[#EEEEF5]">
            <p className="font-medium text-[#080714] leading-relaxed">
              {displayBrief.summary}
            </p>
          </div>

          {/* Visual Direction */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-[11px] uppercase tracking-wider text-[#7C3DFF]">
              Dirección visual acordada
            </h4>
            <ul className="space-y-1 list-disc list-inside text-[#626171]">
              {displayBrief.visualDirection.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Must Have Shots */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-[11px] uppercase tracking-wider text-[#16C95A]">
              Tomas indispensables
            </h4>
            <ul className="space-y-1 list-disc list-inside text-[#626171]">
              {displayBrief.mustHaveShots.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Editing Agreement */}
          <div className="space-y-1">
            <h4 className="font-bold text-[11px] uppercase tracking-wider text-[#080714]">
              Estilo de edición y retoque
            </h4>
            <p className="text-[#626171] leading-relaxed">
              {displayBrief.editingExpectations}
            </p>
          </div>
        </CardContent>

        <CardFooter className="pt-2 flex flex-col gap-2">
          {clientApproved ? (
            <div className="w-full p-4 rounded-xl bg-[#16C95A]/15 border border-[#16C95A]/30 text-center space-y-1">
              <p className="font-poppins font-bold text-sm text-[#16C95A] flex items-center justify-center gap-1.5">
                <ShieldCheck className="h-4 w-4" />
                <span>¡Brief acordado y confirmado!</span>
              </p>
              <p className="text-[11px] text-[#626171]">
                Tu fotógrafo ya tiene la guía visual lista para el día de la sesión.
              </p>
            </div>
          ) : (
            <Button
              variant="primary"
              size="lg"
              loading={isApproving}
              onClick={handleClientApprove}
              className="w-full text-sm gap-2 bg-[#16C95A] hover:bg-[#12a84a]"
            >
              <Check className="h-4 w-4" />
              <span>Aprobar este Visual Brief</span>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
