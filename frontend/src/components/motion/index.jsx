import { motion } from 'framer-motion'

export const FadeIn = ({ children, delay = 0, className = '' }) => (
    <motion.div
        className={className}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay, ease: 'easeOut' }}
    >
        {children}
    </motion.div>
)

export const StaggerContainer = ({ children, className = '', staggerDelay = 0.08 }) => (
    <motion.div
        className={className}
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: staggerDelay } } }}
    >
        {children}
    </motion.div>
)

export const StaggerItem = ({ children, className = '' }) => (
    <motion.div
        className={className}
        variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
        }}
    >
        {children}
    </motion.div>
)

export const FadeInWhenVisible = ({ children, delay = 0, direction = 'up', className = '' }) => {
    const dirs = { up: { y: 40 }, down: { y: -40 }, left: { x: 40 }, right: { x: -40 } }
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, ...dirs[direction] }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay, ease: 'easeOut' }}
        >
            {children}
        </motion.div>
    )
}