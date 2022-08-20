#!/usr/bin/env python

from distutils.core import setup

from pplns_types import version

setup(name='pplns_types',
      version=version,
      description='Types for interfacing with @pplns/core-api.',
      author='Adrian Kriegel',
      author_email='info@unolog.in',
      py_modules=['pplns_types']
     )