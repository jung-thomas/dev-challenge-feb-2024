const cds = require('@sap/cds')
const { Books } = cds.entities('sap.capire.bookshop')

class CatalogService extends cds.ApplicationService {
  async init() {
    const log = cds.log('exit')
    const alert = await cds.connect.to('notifications')
    // Reduce stock of ordered books if available stock suffices
    this.on('submitOrder', async req => {
      const audit = await cds.connect.to('audit-log')
      await audit.log('DevChallenge', { description: 'Submit Order' })
      const { book, quantity } = req.data
      let { stock } = await SELECT`stock`.from(Books, book)
      if (stock >= quantity) {
        await UPDATE(Books, book).with(`stock -=`, quantity)
        await this.emit('OrderedBook', { book, quantity, buyer: req.user.id })
        return { stock }
      }
      else return req.error(409, `${quantity} exceeds stock for book #${book}`)
    })

    // Add some discount for overstocked books
    this.after('READ', 'ListOfBooks', each => {
      if (each.stock > 111) {
        log.info(`Inside ListOfBooks and ready to fire event`)
        alert.notify({
          NotificationTypeKey: 'ListOfBooksRead',
          NotificationTypeVersion: '1',
          Priority: 'NEUTRAL',
          Properties: [
            {
              Key: 'ID',
              IsSensitive: false,
              Language: 'en',
              Value: each.ID,
              Type: 'String'
            },
            {
              Key: 'user',
              IsSensitive: false,
              Language: 'en',
              Value: cds.context.user.id,
              Type: 'String'
            },
            {
              Key: 'title',
              IsSensitive: false,
              Language: 'en',
              Value: each.title,
              Type: 'String'
            },
            {
              Key: 'stock',
              IsSensitive: true,
              Language: 'en',
              Value: each.stock,
              Type: 'String'
            }
          ],
          Recipients: [{ RecipientId: "supportuser1@mycompany.com" }, { RecipientId: "supportuser2@mycompany.com" }]
        }) 
        each.title += ` -- 11% discount!`
      }
    })

    return super.init()
  }
}

module.exports = { CatalogService }
