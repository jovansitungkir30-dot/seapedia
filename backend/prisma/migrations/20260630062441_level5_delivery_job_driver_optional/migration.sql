-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DeliveryJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "driverId" TEXT,
    "orderId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'MENCARI_DRIVER',
    "currentLat" REAL,
    "currentLng" REAL,
    "pickupTime" DATETIME,
    "deliveryTime" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DeliveryJob_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "DeliveryJob_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_DeliveryJob" ("createdAt", "currentLat", "currentLng", "deliveryTime", "driverId", "id", "orderId", "pickupTime", "status", "updatedAt") SELECT "createdAt", "currentLat", "currentLng", "deliveryTime", "driverId", "id", "orderId", "pickupTime", "status", "updatedAt" FROM "DeliveryJob";
DROP TABLE "DeliveryJob";
ALTER TABLE "new_DeliveryJob" RENAME TO "DeliveryJob";
CREATE UNIQUE INDEX "DeliveryJob_orderId_key" ON "DeliveryJob"("orderId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
