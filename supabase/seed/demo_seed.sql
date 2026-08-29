-- ============================================================================
-- demo_seed.sql
-- Idempotent Demo Seed Data for ENCUADRE Hackathon Showcase
-- ============================================================================

-- DEMO USER CONSTANTS
DO $$
DECLARE
  demo_user_id UUID := 'd0000000-0000-0000-0000-000000000001';
  client_1_id UUID := 'c0000000-0000-0000-0000-000000000001';
  client_2_id UUID := 'c0000000-0000-0000-0000-000000000002';
  client_3_id UUID := 'c0000000-0000-0000-0000-000000000003';
  proj_aligned_id UUID := 'b0000000-0000-0000-0000-000000000001';
  proj_divergent_id UUID := 'b0000000-0000-0000-0000-000000000002';
  proj_waiting_id UUID := 'b0000000-0000-0000-0000-000000000003';
  img_1_id UUID := 'a0000000-0000-0000-0000-000000000001';
  img_2_id UUID := 'a0000000-0000-0000-0000-000000000002';
  img_3_id UUID := 'a0000000-0000-0000-0000-000000000003';
  img_4_id UUID := 'a0000000-0000-0000-0000-000000000004';
  img_5_id UUID := 'a0000000-0000-0000-0000-000000000005';
  img_6_id UUID := 'a0000000-0000-0000-0000-000000000006';
  session_1_id UUID := 'e0000000-0000-0000-0000-000000000001';
  brief_1_id UUID := 'f0000000-0000-0000-0000-000000000001';
BEGIN

  -- 1. Demo Profile
  INSERT INTO profiles (id, display_name, studio_name, timezone)
  VALUES (demo_user_id, 'Martín Valdivia', 'Valdivia Visual Studio', 'America/Lima')
  ON CONFLICT (id) DO UPDATE SET
    display_name = 'Martín Valdivia',
    studio_name = 'Valdivia Visual Studio';

  -- 2. Demo Clients
  INSERT INTO clients (id, owner_id, name, email, phone)
  VALUES
    (client_1_id, demo_user_id, 'Ana & Carlos (Boda)', 'ana.carlos@demo.com', '+51 987 654 321'),
    (client_2_id, demo_user_id, 'Sofía Larrea (Retrato Editorial)', 'sofia.larrea@demo.com', '+51 912 345 678'),
    (client_3_id, demo_user_id, 'Familia Mendoza (Sesión Exterior)', 'familia.mendoza@demo.com', '+51 999 888 777')
  ON CONFLICT (id) DO NOTHING;

  -- 3. Demo Portfolio Images
  INSERT INTO portfolio_images (id, owner_id, storage_path, thumbnail_path, width, height, bytes, category, is_style_reference, analysis_status)
  VALUES
    (img_1_id, demo_user_id, 'demo/warm_candid_1.webp', 'demo/warm_candid_1_thumb.webp', 1920, 1280, 320000, 'Boda', true, 'completed'),
    (img_2_id, demo_user_id, 'demo/warm_candid_2.webp', 'demo/warm_candid_2_thumb.webp', 1920, 1280, 290000, 'Boda', true, 'completed'),
    (img_3_id, demo_user_id, 'demo/golden_light_1.webp', 'demo/golden_light_1_thumb.webp', 1920, 1280, 350000, 'Retrato', true, 'completed'),
    (img_4_id, demo_user_id, 'demo/intimate_moment.webp', 'demo/intimate_moment_thumb.webp', 1920, 1280, 310000, 'Retrato', true, 'completed'),
    (img_5_id, demo_user_id, 'demo/documentary_story.webp', 'demo/documentary_story_thumb.webp', 1920, 1280, 280000, 'Eventos', true, 'completed'),
    (img_6_id, demo_user_id, 'demo/natural_light_outdoor.webp', 'demo/natural_light_outdoor_thumb.webp', 1920, 1280, 340000, 'Exterior', true, 'completed')
  ON CONFLICT (id) DO NOTHING;

  -- 4. Demo Image Features
  INSERT INTO image_features (image_id, feature_version, features, confidence)
  VALUES
    (img_1_id, 'v1.0.0', '{"warmth":0.82,"brightness":0.68,"contrast":0.52,"saturation":0.58,"naturalLight":0.88,"candidness":0.85,"posedness":0.22,"editorialness":0.35,"documentaryness":0.78,"intimacy":0.72,"wideComposition":0.45,"retouchLevel":0.25,"emotionalIntensity":0.80,"minimalism":0.55}'::jsonb, '{"warmth":0.95}'::jsonb),
    (img_2_id, 'v1.0.0', '{"warmth":0.78,"brightness":0.72,"contrast":0.48,"saturation":0.62,"naturalLight":0.92,"candidness":0.82,"posedness":0.25,"editorialness":0.40,"documentaryness":0.75,"intimacy":0.68,"wideComposition":0.50,"retouchLevel":0.28,"emotionalIntensity":0.75,"minimalism":0.60}'::jsonb, '{"warmth":0.95}'::jsonb),
    (img_3_id, 'v1.0.0', '{"warmth":0.85,"brightness":0.65,"contrast":0.55,"saturation":0.55,"naturalLight":0.85,"candidness":0.75,"posedness":0.30,"editorialness":0.45,"documentaryness":0.70,"intimacy":0.80,"wideComposition":0.40,"retouchLevel":0.22,"emotionalIntensity":0.85,"minimalism":0.50}'::jsonb, '{"warmth":0.95}'::jsonb)
  ON CONFLICT (image_id) DO NOTHING;

  -- 5. Style DNA Profile for Photographer
  INSERT INTO style_profiles (owner_id, vector, spread, sample_count, algorithm_version)
  VALUES (
    demo_user_id,
    '{"warmth":0.82,"brightness":0.68,"contrast":0.52,"saturation":0.58,"naturalLight":0.88,"candidness":0.81,"posedness":0.26,"editorialness":0.40,"documentaryness":0.74,"intimacy":0.73,"wideComposition":0.45,"retouchLevel":0.25,"emotionalIntensity":0.80,"minimalism":0.55}'::jsonb,
    '{"warmth":0.04,"brightness":0.03,"contrast":0.03,"saturation":0.03,"naturalLight":0.04,"candidness":0.05,"posedness":0.04,"editorialness":0.05,"documentaryness":0.04,"intimacy":0.06,"wideComposition":0.05,"retouchLevel":0.03,"emotionalIntensity":0.05,"minimalism":0.05}'::jsonb,
    6,
    'v1.0.0'
  )
  ON CONFLICT (owner_id) DO UPDATE SET sample_count = 6;

  -- 6. Demo Projects
  INSERT INTO projects (id, owner_id, client_id, name, type, event_date, status, alignment_score)
  VALUES
    (proj_aligned_id, demo_user_id, client_1_id, 'Boda Ana & Carlos en Cieneguilla', 'wedding', NOW() + INTERVAL '30 days', 'aligned', 87.00),
    (proj_divergent_id, demo_user_id, client_2_id, 'Retrato Profesional Sofía Larrea', 'portrait', NOW() + INTERVAL '14 days', 'active', 64.00),
    (proj_waiting_id, demo_user_id, client_3_id, 'Sesión Familiar Mendoza - Primavera', 'family', NOW() + INTERVAL '45 days', 'active', NULL)
  ON CONFLICT (id) DO NOTHING;

  -- 7. Demo Alignment Result for Project 1 (87% alignment)
  INSERT INTO alignment_results (project_id, score, dimensions, mismatches, explanation, algorithm_version)
  VALUES (
    proj_aligned_id,
    87.00,
    '[{"key":"warmth","photographerValue":0.82,"clientValue":0.85,"difference":0.03,"weight":1.2},{"key":"naturalLight","photographerValue":0.88,"clientValue":0.90,"difference":0.02,"weight":1.3},{"key":"candidness","photographerValue":0.81,"clientValue":0.84,"difference":0.03,"weight":1.4},{"key":"retouchLevel","photographerValue":0.25,"clientValue":0.35,"difference":0.10,"weight":1.6}]'::jsonb,
    '[{"dimension":"retouchLevel","photographerValue":0.25,"clientValue":0.35,"difference":0.10,"explanation":"El cliente espera un nivel de retoque facial ligeramente mayor (+10%) respecto a tu estándar."}]'::jsonb,
    'Compatibilidad excepcional (87%). El cliente comprende y busca exactamente tu lenguaje visual cálido y espontáneo.',
    'v1.0.0'
  )
  ON CONFLICT (project_id) DO NOTHING;

  -- 8. Demo Brief for Project 1
  INSERT INTO briefs (id, project_id, version, content, status)
  VALUES (
    brief_1_id,
    proj_aligned_id,
    1,
    '{"visualDirection":["Luz natural de atardecer / hora dorada","Captura de emociones espontáneas y risas genuinas","Tonalidades cálidas y orgánicas"],"priorityAttributes":["Luz natural","Espontaneidad","Retratos en movimiento"],"avoid":["Poses estáticas y formales de catálogo","Filtros fríos o desaturados"],"mustHaveShots":["Primer encuentro de la pareja","Risas de los padres durante votos","Tomas espontáneas con invitados"],"editingExpectations":"Edición cálida y balanceada con textura de piel natural y retoque sutil.","referenceImageIds":["a0000000-0000-0000-0000-000000000001","a0000000-0000-0000-0000-000000000002"],"openQuestions":["Confirmar locación exacta para la hora dorada (16:30 - 17:45)."],"summary":"Acuerdo visual para una boda emotiva, cálida y 100% fiel a los momentos auténticos."}'::jsonb,
    'approved'
  )
  ON CONFLICT (id) DO NOTHING;

  -- 9. Dual Approvals for Demo Brief
  INSERT INTO brief_approvals (brief_id, actor_type, approved_at, comment)
  VALUES
    (brief_1_id, 'photographer', NOW() - INTERVAL '2 hours', 'Aprobado. Alineado con el estilo del estudio.'),
    (brief_1_id, 'client', NOW() - INTERVAL '1 hour', '¡Nos encanta! Es exactamente lo que queríamos.')
  ON CONFLICT (brief_id, actor_type) DO NOTHING;

END $$;
