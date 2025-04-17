import { Button } from "@/components/ui/button"
import { ThemeProvider } from "@/contexts/theme-provider"
import { ThemeToggle } from "@/components/common/theme-toggle"

function App() {

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Button>Button</Button>
      <ThemeToggle />
    </ThemeProvider>
  )
}

export default App
