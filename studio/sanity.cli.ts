import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {projectId: 'x77edsca', dataset: 'production'}, // <-- your id
  deployment: {autoUpdates: true},
})
