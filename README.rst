frontend-app-enterprise-checkout
##########################

|license-badge| |status-badge| |ci-badge| |codecov-badge|

.. |license-badge| image:: https://img.shields.io/github/license/edx/frontend-app-enterprise-checkout.svg
    :target: https://github.com/edx/frontend-app-enterprise-checkout/blob/main/LICENSE
    :alt: License

.. |status-badge| image:: https://img.shields.io/badge/Status-Maintained-brightgreen

.. |ci-badge| image:: https://github.com/edx/frontend-app-enterprise-checkout/actions/workflows/ci.yml/badge.svg
    :target: https://github.com/edx/frontend-app-enterprise-checkout/actions/workflows/ci.yml
    :alt: Continuous Integration

.. |codecov-badge| image:: https://codecov.io/github/edx/frontend-app-enterprise-checkout/coverage.svg?branch=main
    :target: https://codecov.io/github/edx/frontend-appenterprise-checkout?branch=main
    :alt: Codecov

Purpose
=======

This micro-frontend (MFE) supports a self-service B2B checkout experience to onboard and provision new enterprise customers via Stripe. It intends
to be a top-of-funnel entrypoint, bridging the gap between a B2B marketing website and the authenticated Enterprise Admin/Learner experience. In addition
to the Stripe integration, the MFE collects minimal information required to provision the enterprise customer, as well as handles user logistration (i.e.,
account registration and login support).

Getting Started
===============

Devstack Installation
---------------------

This MFE requires a devstack installation to run. Follow these steps to provision and run an
instance of the Open edX platform powering this MFE via `devstack`_.

.. _devstack: https://github.com/openedx/devstack#getting-started

In addition to the core services within devstack, you will need to setup the following enterprise Django IDAs:

- `enterprise-access`_

.. _enterprise-access: https://github.com/openedx/enterprise-access

Once you have a devstack installation in addition to the required enterprise Django IDAs, you may run this MFE directly from
your local machine.

#. Start the devstack with:

   .. code-block::

      cd devstack
      make dev.pull
      make dev.provision
      make dev.up

#. Start the required enterprise Django IDAs, per their respective READMEs.

#. Before starting the `enterprise-access` service, add required settings:

   Navigate to the `enterprise-access` codebase and create a file inside enterprise_access/settings/private.py:
   Add the following contents (update values as needed):

   .. code-block::

      ENABLE_CUSTOMER_BILLING_API = True
      STRIPE_API_KEY = 'XXXXXXXXXXXXXXXXXXX'   # Please update this value from stripe stage account
      SSP_PRODUCTS = {
         'yearly_license_plan': {
            'lookup_key': 'teams_subscription_license_yearly',
            'quantity_range': [5, 50],
         }
      }

   Then start the `enterprise-access` service.

#. Start this MFE with:

   .. code-block::

      cd frontend-app-enterprise-checkout
      nvm use
      npm ci
      npm start

#. Finally, open the MFE in a browser

   Navigate to `http://localhost:1989 <http://localhost:1989>`_ to open the MFE.

Configuration
-------------

.. note::

   [TODO]

   Explicitly list anything that this MFE requires to function correctly.  This includes:

   * A list of both required and optional .env variables, and how they each
     affect the functioning of the MFE

   * A list of edx-platform `feature and waffle flags`_ that are either required
     to enable use of this MFE, or affect the behavior of the MFE in some other
     way

   * A list of IDAs or other MFEs that this MFE depends on to function correctly

.. _feature and waffle flags: https://docs.openedx.org/projects/openedx-proposals/en/latest/best-practices/oep-0017-bp-feature-toggles.html

Plugins
=======

This MFE can be customized using `Frontend Plugin Framework <https://github.com/openedx/frontend-plugin-framework>`_.

The parts of this MFE that can be customized in that manner are documented `here </src/plugin-slots>`_.

Getting Help
============

While this MFE is available for you to use, we are unable to provide support and do not guarantee
reviewing and/or merging open-source contributions.

If you have a question or need help, the best path is to open an issue in this repository
with as many details about the issue you are facing as you can provide.

https://github.com/edx/frontend-app-enterprise-checkout/issues

License
=======

The code in this repository is licensed under the AGPLv3 unless otherwise
noted.

Please see `LICENSE <LICENSE>`_ for details.

Contributing
============

This repository is not currently accepting open-source contributions.

Reporting Security Issues
=========================

Please do not report security issues in public.  Email security@edx.org instead.
