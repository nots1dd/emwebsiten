#include <mywebsite/gl/VertexArray.hpp>

VertexArray::VertexArray() { glGenVertexArrays(1, &id_); }

VertexArray::~VertexArray() { glDeleteVertexArrays(1, &id_); }

void VertexArray::bind() const { glBindVertexArray(id_); }
