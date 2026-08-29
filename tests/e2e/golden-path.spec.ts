import { test, expect } from '@playwright/test'

// ─── Golden Path E2E Test ─────────────────────────────────────────────────────
// This test covers the complete ENCUADRE flow:
// Photographer creates project → generates link → client responds → alignment → brief → approval

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000'
const DEMO_EMAIL = 'demo@encuadre.app'
const DEMO_PASSWORD = 'EncuadreDemo2024!'

test.describe('Golden Path - Complete ENCUADRE Flow', () => {
  let clientSessionUrl: string

  test.describe('Photographer Flow (Desktop)', () => {
    test.use({ viewport: { width: 1440, height: 900 } })

    test('1. Photographer can sign in', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/login`)
      await page.getByLabel('Email').fill(DEMO_EMAIL)
      await page.getByLabel('Contraseña').fill(DEMO_PASSWORD)
      await page.getByRole('button', { name: 'Iniciar sesión' }).click()
      await page.waitForURL(`${BASE_URL}/app`)
      await expect(page.getByText('Hola,')).toBeVisible()
    })

    test('2. Dashboard shows actionable data', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/login`)
      await page.getByLabel('Email').fill(DEMO_EMAIL)
      await page.getByLabel('Contraseña').fill(DEMO_PASSWORD)
      await page.getByRole('button', { name: 'Iniciar sesión' }).click()
      await page.waitForURL(`${BASE_URL}/app`)
      await expect(page.getByText('Proyectos activos')).toBeVisible()
    })

    test('3. Photographer can create a new project', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/login`)
      await page.getByLabel('Email').fill(DEMO_EMAIL)
      await page.getByLabel('Contraseña').fill(DEMO_PASSWORD)
      await page.getByRole('button', { name: 'Iniciar sesión' }).click()
      await page.waitForURL(`${BASE_URL}/app`)

      await page.getByRole('link', { name: '+ Nuevo proyecto' }).click()
      await page.waitForURL(`${BASE_URL}/app/projects/new`)

      // Step 1: Project info
      await page.getByLabel('Nombre del proyecto').fill('Test E2E Project')
      await page.getByLabel('Tipo de sesión').selectOption('portrait')
      await page.getByRole('button', { name: 'Siguiente' }).click()

      // Step 2: Client selection (use existing demo client)
      await page.getByText('Ana García').click()
      await page.getByRole('button', { name: 'Siguiente' }).click()

      // Step 3: Reference images (select 3+)
      const images = page.locator('[data-testid="portfolio-image"]')
      await images.nth(0).click()
      await images.nth(1).click()
      await images.nth(2).click()
      await page.getByRole('button', { name: 'Siguiente' }).click()

      // Step 4: Generate link
      await page.getByRole('button', { name: 'Generar enlace' }).click()
      await page.waitForSelector('[data-testid="session-url"]')
      
      // Capture the session URL for client test
      clientSessionUrl = await page.locator('[data-testid="session-url"]').textContent() ?? ''
      expect(clientSessionUrl).toContain('/s/')
    })

    test('4. Photographer can view alignment after client completes', async ({ page, context }) => {
      // This test assumes client has already completed session (run after client tests)
      await page.goto(`${BASE_URL}/auth/login`)
      await page.getByLabel('Email').fill(DEMO_EMAIL)
      await page.getByLabel('Contraseña').fill(DEMO_PASSWORD)
      await page.getByRole('button', { name: 'Iniciar sesión' }).click()
      await page.waitForURL(`${BASE_URL}/app`)

      // Navigate to most recent project
      await page.getByRole('link', { name: 'Proyectos' }).click()
      await page.getByText('Test E2E Project').click()
      await page.getByRole('tab', { name: 'Alineación' }).click()

      // Check alignment score visible
      await expect(page.locator('[data-testid="alignment-score"]')).toBeVisible()
    })

    test('5. Photographer can generate and approve brief', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/login`)
      await page.getByLabel('Email').fill(DEMO_EMAIL)
      await page.getByLabel('Contraseña').fill(DEMO_PASSWORD)
      await page.getByRole('button', { name: 'Iniciar sesión' }).click()
      await page.waitForURL(`${BASE_URL}/app`)

      await page.getByRole('link', { name: 'Proyectos' }).click()
      await page.getByText('Test E2E Project').click()
      await page.getByRole('tab', { name: 'Alineación' }).click()
      await page.getByRole('button', { name: 'Generar Visual Brief' }).click()

      // Wait for brief to generate
      await page.waitForSelector('[data-testid="brief-content"]', { timeout: 30000 })

      // Navigate to Brief tab and approve
      await page.getByRole('tab', { name: 'Brief' }).click()
      await page.getByRole('button', { name: 'Aprobar Brief' }).click()
      
      await expect(page.getByText('Fotógrafo: Aprobado')).toBeVisible()
    })
  })

  test.describe('Client Flow (Mobile)', () => {
    test.use({ viewport: { width: 390, height: 844 } })

    test('6. Client can open session link without login', async ({ page }) => {
      // Use demo session URL - in CI this would use a pre-seeded session
      const sessionUrl = `${BASE_URL}/s/demo-test-token-for-e2e`
      await page.goto(sessionUrl)
      
      // Should see welcome screen, not login
      await expect(page.getByText('Tu sesión fotográfica comienza aquí')).toBeVisible()
      await expect(page.getByRole('button', { name: 'Comenzar' })).toBeVisible()
    })

    test('7. Client completes pairwise comparisons', async ({ page }) => {
      const sessionUrl = `${BASE_URL}/s/demo-test-token-for-e2e`
      await page.goto(sessionUrl)
      await page.getByRole('button', { name: 'Comenzar' }).click()
      await page.waitForURL(/\/preferences$/)

      // Complete all pairwise choices
      let choicesCompleted = 0
      while (choicesCompleted < 12) {
        const progressText = await page.locator('[data-testid="progress"]').textContent()
        if (!progressText) break

        // Click first image choice
        const choiceButtons = page.getByRole('button', { name: /Elegir/i })
        if (await choiceButtons.count() === 0) break
        
        await choiceButtons.first().click()
        choicesCompleted++
        
        // Check if redirected to questions
        if (page.url().includes('/questions')) break
        await page.waitForTimeout(300) // Allow transition
      }

      expect(choicesCompleted).toBeGreaterThan(0)
    })

    test('8. Client answers context questions', async ({ page }) => {
      const sessionUrl = `${BASE_URL}/s/demo-test-token-for-e2e/questions`
      await page.goto(sessionUrl)
      
      // Answer questions
      const sessionTypeSelect = page.getByLabel('Tipo de sesión')
      if (await sessionTypeSelect.count() > 0) {
        await sessionTypeSelect.selectOption('portrait')
      }
      
      await page.getByRole('button', { name: 'Enviar preferencias' }).click()
      await page.waitForURL(/\/result$/, { timeout: 30000 })
    })

    test('9. Client sees alignment result', async ({ page }) => {
      const sessionUrl = `${BASE_URL}/s/demo-test-token-for-e2e/result`
      await page.goto(sessionUrl)

      // Score should be visible
      await expect(page.locator('[data-testid="client-score"]')).toBeVisible()
      // Brief link should be available
      await expect(page.getByRole('link', { name: /brief/i })).toBeVisible()
    })

    test('10. Client approves brief', async ({ page }) => {
      const sessionUrl = `${BASE_URL}/s/demo-test-token-for-e2e/brief`
      await page.goto(sessionUrl)

      await expect(page.getByText('Brief Visual')).toBeVisible()
      await page.getByRole('button', { name: 'Aprobar Brief' }).click()

      await expect(page.getByText('Brief acordado')).toBeVisible({ timeout: 10000 })
    })
  })

  test.describe('Security & Error States', () => {
    test('Invalid token shows error page', async ({ page }) => {
      await page.goto(`${BASE_URL}/s/invalid-token-xyz`)
      await expect(page.getByText(/enlace.*inválido|expirado/i)).toBeVisible()
    })

    test('/app routes redirect to login when unauthenticated', async ({ page }) => {
      await page.goto(`${BASE_URL}/app`)
      await page.waitForURL(`${BASE_URL}/auth/login`)
    })

    test('Responsive: client layout has no horizontal overflow on mobile', async ({ page }) => {
      test.use({ viewport: { width: 360, height: 800 } })
      await page.goto(`${BASE_URL}/s/demo-test-token-for-e2e`)
      
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
      const windowWidth = await page.evaluate(() => window.innerWidth)
      
      expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 1) // +1 for rounding
    })
  })
})
