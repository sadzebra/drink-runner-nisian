import { useEffect, useState } from "react" 
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'
import 'bootstrap/dist/css/bootstrap.min.css'

/*
    TODO (for v1.0)
        - Reconfigure the way the data is store, let's try and reduce some of these 'useState' declarations
            - The data can probably be stored in just a couple of state variables
        - Update the UI with bootstraps or MUI and make it look better
            - Bonus points for adding transitions
        - Attempt to abstract UI and logic to components
        - Implement State provider ??????
        - implement routing
        - Produce documentation
*/


function App() {
    const [users, setUsers] = useState()
    const [showStartBtn, setShowStartBtn] = useState(true)
    const [showUserForm, setShowUserForm] = useState(false)
    const [selectedUser, setSelectedUser] = useState(null)
    const [newUserFirstName, setNewUserFirstName] = useState(null)
    const [newUserLastName, setNewUserLastName] = useState(null)
    const [drink, setDrink] = useState(null)
    const [extras, setExtras] = useState(null)
    const [instructions, setInstructions] = useState(null)
    const [currentRound, setCurrentRound] = useState(null)
    const [drinkMaker, setDrinkMaker] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [showDrinkRunner, setShowDrinkRunner] = useState(false)

    useEffect(() => {
        const fetchUsers = async () => {
            const response = await fetch("/api/v1/Users")
            const data = await response.json()
            setUsers(data)
        }
        fetchUsers()
    }, [])

    const handleStartRound = () => {
        setShowStartBtn(false)
        setShowUserForm(true)
        setCurrentRound({orders:[] ,drinkMaker: null})
    }

    const handleCreateUser = async (e) => {
        e.preventDefault()
        try {
            const response = await fetch("/api/v1/Users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    firstName: newUserFirstName,
                    lastName: newUserLastName,
                }),
            })

            if (!response.ok) {
                throw new Error("Failed to create user")
            }

            const data = await response.json()
            setUsers([...users, data])
            setSelectedUser(data.id)
            setNewUserFirstName("")
            setNewUserLastName("")
        } 
        catch (e) {
            console.error("Error creating user:", e)
        }
    }

    const handleAddOrder = async (e) => {
        e.preventDefault()
        let theOrder = {
            userId: selectedUser,
            name: selectedUser,
            type: drink, 
            additionalSpecification: {
                extras: extras,
                instructions: instructions,
            }
        }

        if (selectedUser) {
            try {
                const response = await fetch("/api/v1/DrinkOrder", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(theOrder), 
                })
                
                if (!response.ok) {
                    throw new Error("Failed to create drink order")
                }
                
                const orderData = await response.json()

                theOrder.orderId = orderData.id

                setCurrentRound((prevRound) => ({
                    ...prevRound,
                    orders: [
                        ...prevRound.orders,
                        theOrder
                    ],
                }))

                setDrink("")
                setExtras("")
                setInstructions("")
            } 
            catch (error) {
                console.error("Error adding order:", error)
            }
        }
    }

    const handleCompleteRound = async () => {
        try {
            const usersWithOrders = currentRound.orders.map(order => order.userId)
            const randomUserIndex = Math.floor(Math.random() * usersWithOrders.length)
            const randomUserId = usersWithOrders[randomUserIndex]
            setDrinkMaker(randomUserId)

            const participants = currentRound.orders.map((order) => ({
                userId: order.userId,
                orderId: order.orderId,
                drinkMaker: drinkMaker
            }))

            const response = await fetch("/api/v1/DrinkRun", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ participants }),
            })

            if (!response.ok) {
                throw new Error("Failed to complete round")
            }

            const data = await response.json()
            setShowDrinkRunner(true)
            console.log("Round completed:", data)
        } 
        catch (e) {
            console.error("Error completing round:", e)
        }
    }

    const handleShowAddUserModal = () => setShowModal(true)
    const HandleCloseAddUserModal = () => setShowModal(false)

    const handleShowRunnerModal = () => setShowDrinkRunner(true)
    const handleCloseRunnerModal = () => setShowDrinkRunner(false)

    return (
        <div className="container">
            <h1 className="my-4 text-center">Drink Round App</h1>

            <div className="row">
                <div className="col-md-6"> 
                    <div className="card shadow-sm mb-4"> 
                        <div className="card-body">
                            {showStartBtn && (
                                <button className="btn btn-primary mb-3" onClick={handleStartRound} disabled={showUserForm}>
                                    Start Round
                                </button>
                            )}

                            {showUserForm && (
                                <div>
                                    <h2>Select User</h2>
                                    <select className="form-select mb-3" onChange={(e) => setSelectedUser(e.target.value)}>
                                        <option value="">Select User</option>
                                            {users.map((user) => (
                                                <option key={user.id} value={user.id}>
                                                    {user.firstName} {user.lastName}
                                                </option>
                                            ))}
                                    </select>

                                    <Button variant="primary" onClick={handleShowAddUserModal}>Add New User</Button>

                                    <Modal show={showModal} onHide={HandleCloseAddUserModal}>
                                        <Modal.Header closeButton>
                                            <Modal.Title>Or Create New User</Modal.Title>
                                        </Modal.Header>
                                        <Modal.Body>
                                            <Form>
                                                <Form.Group className="mb-3" controlId="addUserFirstName">
                                                    <Form.Label>First Name</Form.Label>
                                                    <Form.Control type="text" placeholder="Enter First Name" value={newUserFirstName} onChange={(e) => setNewUserFirstName(e.target.value)} />
                                                </Form.Group>

                                                <Form.Group className="mb-3" controlId="addUserLastName">
                                                    <Form.Label>Last Name</Form.Label>
                                                    <Form.Control type="text" placeholder="Last Name" value={newUserLastName} onChange={(e) => setNewUserLastName(e.target.value)} />
                                                </Form.Group>
                                                <Button variant="primary" type="submit" onClick={handleCreateUser}> Create User</Button>
                                            </Form>
                                        </Modal.Body>
                                    </Modal>

                                    {selectedUser && (
                                        <div className="mt-4">
                                            <h2>Order Form</h2>
                                            <div className="mb-3">
                                                <input type="text" className="form-control" placeholder="Drink" value={drink} onChange={(e) => setDrink(e.target.value)} />
                                            </div>
                                            <div className="mb-3">
                                                <input type="text" className="form-control" placeholder="Extras" value={extras} onChange={(e) => setExtras(e.target.value)} />
                                            </div>
                                            <div className="mb-3">
                                                <input type="text" className="form-control" placeholder="Instructions" value={instructions} onChange={(e) => setInstructions(e.target.value)}/>
                                            </div>
                                            <button className="btn btn-primary" onClick={handleAddOrder} >
                                                Add Order
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-md-6"> 
                    {currentRound && currentRound.orders.length > 0 && (
                        <div className="card shadow-sm"> 
                            <div className="card-body">
                                <h3 className="mb-3">Current Orders</h3>
                                <ul className="list-group list-group-flush"> 
                                    {currentRound.orders.map((order) => (
                                        <li className="list-group-item" key={order.orderId}>
                                            
                                            <p>{users.find((user) => user.id === order.userId)?.firstName}</p>
                                            <p>{order.type} - {order.additionalSpecification.extras} - {order.additionalSpecification.instructions}</p>
                                        </li>
                                    ))}
                                </ul>

                                <button className="btn btn-primary mt-3" onClick={handleCompleteRound}>
                                    Complete Order
                                </button>
                            </div>
                        </div>
                    )}

                    {showDrinkRunner && (
                        <Modal show={handleShowRunnerModal} onHide={handleCloseRunnerModal}>
                            <Modal.Header closeButton>
                                <Modal.Title>The Lucky Winner</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <p>{users.find((user) => user.id === drinkMaker)?.firstName}</p>
                            </Modal.Body>
                        </Modal>

                    )}
                </div>
            </div>
        </div>
    )
}

export default App