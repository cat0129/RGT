import react from "react";
import Book from "./Book";
import { Router } from "express";
import { Route } from "react-router-dom";

function App(){
   return (
    <Router>
        <Route path="/api/books" element={<Book />} />
    </Router>    
   )
}