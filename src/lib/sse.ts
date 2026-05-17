type ClientController = ReadableStreamDefaultController<string>

const clients = new Map<string, Set<ClientController>>()

export function addClient(userId: string, controller: ClientController) {
  let userClients = clients.get(userId)
  if (!userClients) {
    userClients = new Set()
    clients.set(userId, userClients)
  }
  userClients.add(controller)
}

export function removeClient(userId: string, controller: ClientController) {
  const userClients = clients.get(userId)
  if (!userClients) return
  userClients.delete(controller)
  if (userClients.size === 0) clients.delete(userId)
}

export function pushEvent(userId: string, event: string, data: unknown) {
  const userClients = clients.get(userId)
  if (!userClients) return
  const message = event ? `event: ${event}\ndata: ${JSON.stringify(data)}\n\n` : `data: ${JSON.stringify(data)}\n\n`
  for (const controller of userClients) {
    try {
      controller.enqueue(message)
    } catch {
      userClients.delete(controller)
    }
  }
}
