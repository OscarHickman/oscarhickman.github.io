---
title: Projects - Oscar Hickman
display: Projects
description: All projects, from cosmology research to software applications.
wrapperClass: 'text-center'
art: dots
---

<script setup>
import { projectCategories } from '~/data/projects'

const projects = Object.fromEntries(
  projectCategories.map(cat => [cat.name, cat.projects])
)
</script>

<ListProjects :projects="projects" />
