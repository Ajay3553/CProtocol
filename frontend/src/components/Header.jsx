import React from 'react'
import Container from './Container'
import {Link} from 'react-router-dom'
import logo from '../assets/logo.png'
import { TfiAlignJustify } from "react-icons/tfi";

function Header() {

    const navItems = [
        {
            name: 'Home',
            slug: '/'
        },
        {
            name: 'About',
            slug: '/about'
        },
        {
            name: 'Contact',
            slug: '/contact-us'

        }
    ]

    return (
        <>
            <header className='pt-2 pb-2 sm:h-14 bg-gradient-to-r from-purple-300 to-pink-300'>
                <Container>
                    <nav className='flex items-center justify-between w-full -mt-1'>
                        <div className='w-[90px] h-[50px] items-center hidden sm:flex -ml-5'>
                            <Link to="/">
                                <img src={logo} alt="logo" className='w-full h-full object-cover overflow-hidden' />
                            </Link>
                        </div>
                        <div className='ml-10'>
                            <ul className='flex items-center gap-2 sm:gap-4 sm:-ml-10'>
                            {navItems.map((item) => (
                                <li key={item.name}>
                                    <Link to={item.slug} className='inline-block mx-2 cursor-pointer text-xs sm:text-base hover:text-gray-200 duration-400'>
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        </div>
                        <button className='rounded-lg hover:cursor-pointer sm:text-2xl sm:px-1 hover:text-gray-200'>
                            <TfiAlignJustify />
                        </button>
                    </nav>
                </Container>
            </header>
        </>
    )
}

export default Header