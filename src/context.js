import React, { Component } from 'react'
// import items from './data'
import Client from './Contentful'

const RoomContext = React.createContext();
// this creates two comps, provider and consumer

class RoomProvider extends Component {
    state = {
        rooms: [],
        sortedRooms: [],
        featuredRooms: [],
        loading: true,
        type: 'all',
        capacity: 1,
        price: 0,
        minPrice: 0,
        maxPrice: 0,
        minSize: 0,
        maxSize: 0,
        breakfast: false,
        pets: false
    }
    // getData from contentful
    getData = async () => {
        try {
            let response = await Client.getEntries({
                content_type: 'beachResortRoomExample',
                order: "sys.createdAt"
            })
            
                let rooms = this.formatData(response.items)
                //response.items is the array of data, how it was built to match the format
                let featuredRooms = rooms.filter(room => room.featured === true)
                let maxPrice = Math.max(...rooms.map(item => item.price))
                let maxSize = Math.max(...rooms.map(item => item.size))
                this.setState({
                    rooms,
                    featuredRooms,
                    sortedRooms:rooms,
                    loading:false,
                    price:maxPrice,
                    maxPrice,
                    maxSize
                })
            
        } catch (error) {
            console.log(error)
        }
    }

    // get data from regular data.js
    // componentDidMount() {
    //     let rooms = this.formatData(items)
    //     let featuredRooms = rooms.filter(room => room.featured === true)
    //     let maxPrice = Math.max(...rooms.map(item => item.price))
    //     let maxSize = Math.max(...rooms.map(item => item.size))
    //     this.setState({
    //         rooms,
    //         featuredRooms,
    //         sortedRooms:rooms,
    //         loading:false,
    //         price:maxPrice,
    //         maxPrice,
    //         maxSize
    //     })
    // }
    componentDidMount() {
        this.getData()
    }

    formatData(items) {
        let tempItems = items.map(item => {
            let id = item.sys.id
            let images = item.fields.images.map(image => {
                return image.fields.file.url
            })
            let room = {...item.fields, images, id}
            return room
        })
        return tempItems
    }

    getRoom = (slug) => {
        let tempRooms = [...this.state.rooms]
        const room = tempRooms.find((room) => room.slug === slug)
        return room;
    }

    handleChange = (event) => {
        const target = event.target
        const value = target.type === 'checkbox' ? target.checked : target.value
        const name = event.target.name
        this.setState({
            [name]:value
            // the idea here is that we get the target to be anything we clicked, room type or capacity etc
            // we check it for 
        }, this.filterRooms)
        // console.log(`this is type ${type}, this is name ${name}, this is value ${value}`)
    }

    filterRooms = () => {
        let {
            rooms, type, capacity, price, minSize, maxSize, breakfast, pets
        } = this.state

        // all the rooms
        let tempRooms = [...rooms]

        // transform value
        capacity = parseInt(capacity)

        //filter by type
        if(type !== 'all') {
            tempRooms = tempRooms.filter(room => room.type === type)
        }
        //filter by capacity
        if(capacity !== 1) {
            tempRooms = tempRooms.filter(room => room.capacity >= capacity)
        }

        //filter by price
        tempRooms = tempRooms.filter(room => room.price <= price)

        //filter by size
        tempRooms = tempRooms.filter(room => room.size >= minSize && room.size <= maxSize)

        //filter by breakfast
        if(breakfast) {
            tempRooms = tempRooms.filter(room => room.breakfast === true)
        }

        //filter by pets
        if(pets) {
            tempRooms = tempRooms.filter(room => room.pets === true)
        }

        // change state
        this.setState({
            sortedRooms: tempRooms
        })
    }

    render() {
        return (
            <RoomContext.Provider value={{...this.state, getRoom: this.getRoom, handleChange: this.handleChange}}>
                {this.props.children}
            </RoomContext.Provider>
        )
    }
}

const RoomConsumer = RoomContext.Consumer;

export function withRoomConsumer(Component){
    return function ConsumerWrapper(props){
        return (
            <RoomConsumer>
                {
                    value => <Component {...props} context={value}/>
                }
            </RoomConsumer>
        )
    }
}
// wrapping the component with a function that has the props

export {RoomProvider, RoomConsumer, RoomContext}