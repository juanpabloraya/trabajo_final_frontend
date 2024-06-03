'use client'
import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'
import { eliminarCookie, leerCookie } from '../../../utils/cookies'
import { WebService } from '../../../services'
import { Constantes } from '../../../config'
import { imprimir } from '../../../utils/imprimir'
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
} from '@mui/material'
import { productType, productSave } from '../../../types/Products'
import { TableComponent } from '../../../components/table/tableSimple'
import { ProductFormModal } from '../../../components/form/FormCreateProduct'

const AdminHomePage = () => {
  const [resumenData, setResumenData] = useState<productType[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentProductId, setCurrentProductId] = useState<string | undefined>(undefined)
  const [reloadData, setReloadData] = useState(false);

  const handleOpenModal = (productId: string | undefined = undefined) => {
    setCurrentProductId(productId)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setCurrentProductId(undefined)
  }

  const handleFormSubmit = (formData: productSave) => {
    setResumenData((prevData) => {
      if (currentProductId) {
        setReloadData(true);
        return prevData.map((product) =>
          product.id === currentProductId ? { ...product, ...formData } : product
        )
      } else {
        const newProduct: productType = {
          ...formData,
          id: '', // Ajuste de ID y datos adicionales
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: 1 // Ajuste según sea necesario
        }
        setReloadData(true);
        return [...prevData, newProduct]
      }
    })
    handleCloseModal()
  }

  useEffect(() => {
    const fetchProduct = async () => {
      const token = leerCookie('token')
      console.log("Token:: ",token)
      try {
        const response = await WebService.get({
          url: `${Constantes.baseUrl}/api/products` ?? '',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        imprimir(response)
        setResumenData(response)
      } catch (error) {
        eliminarCookie('token')
        console.error('Error fetching user:', error)
        redirect('/login')
      }
    }
  
    fetchProduct()
  }, [reloadData])

  useEffect(() => {
    console.log('Productos: ', resumenData)
  }, [resumenData])

  return (
    <Container maxWidth="sm" style={{ marginTop: '2rem' }}>
      <Card>
        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom>
            Página de Administrador
          </Typography>
          <Typography variant="h6" component="p">
            Bienvenido, user1@example.com. Aquí puedes gestionar la aplicación.
          </Typography>
          <Box mt={2}>
            <Button onClick={() => handleOpenModal(undefined)} variant="contained" color="primary">
              Nuevo Producto
            </Button>
          </Box>
          <Typography variant="h6" component="p">
            Registros
          </Typography>
          <TableComponent products={resumenData} onEdit={handleOpenModal} />
        </CardContent>
      </Card>

      {isModalOpen && (
        <ProductFormModal
          open={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleFormSubmit}
          productId={currentProductId}
          setReloadData={setReloadData}
        />
      )}
    </Container>
  )
}

export default AdminHomePage